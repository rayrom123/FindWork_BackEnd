const freelancer = require("../models/Freelancer");
const employer = require("../models/Employer");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const { getIO } = require("../config/socket");

const getAllChattedUsers = async (req, res) => {
  try {
    const userID = req.user._id; // Assuming userID is obtained from the request object

    console.log("type of userID", userID); // Debugging: Check type of userID

    // Debugging: Check if userID matches any messages

    // Find distinct user IDs from messages where the user is either sender or receiver
    const chattedUserIds = await Message.aggregate([
      {
        $match: {
          $or: [{ senderID: userID }, { receiverID: userID }],
        },
      },
      {
        $group: {
          _id: null,
          userIds: {
            $addToSet: {
              $cond: [
                { $ne: ["$senderID", userID] },
                "$senderID",
                "$receiverID",
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          userIds: 1,
        },
      },
    ]);

    // Flatten the userIds array and ensure it's not empty
    const userIds = chattedUserIds.length > 0 ? chattedUserIds[0].userIds : [];

    console.log("User IDs of chatted users:", userIds); // Debugging: Check user IDs

    // Fetch freelancers and employers based on the user IDs
    const [freelancers, employers] = await Promise.all([
      freelancer.find({ _id: { $in: userIds } }).select("username"),
      employer.find({ _id: { $in: userIds } }).select("companyName"),
    ]);

    // Combine both results
    const chattedUsers = [...freelancers, ...employers];

    res.status(200).json(chattedUsers);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverID } = req.params;
    const senderID = req.user._id; // Lấy từ xác thực, không lấy từ body/header

    let imageURL;
    if (image) {
      const upLoad = await cloudinary.uploader.upload(image);
      imageURL = upLoad.secure_url;
    }

    if (!text && !image) {
      return res
        .status(400)
        .json({ error: "Please provide a message or an image" });
    }

    const newMessage = new Message({
      senderID,
      receiverID,
      text,
      image: imageURL,
    });

    await newMessage.save();

    const io = getIO();
    // Đảm bảo ép userID về string khi emit để FE nhận được sự kiện
    io.to(String(senderID)).emit("newMessage", newMessage);
    io.to(String(receiverID)).emit("newMessage", newMessage);
    console.log("Emit newMessage to:", String(senderID), String(receiverID));

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error); // Debugging: Check error details
    res.status(500).json({ error: "Failed to send message" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: receiverID } = req.params;
    const senderID = req.user._id; // Lấy từ xác thực

    const messages = await Message.find({
      $or: [
        { senderID, receiverID },
        { senderID: receiverID, receiverID: senderID },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllChattedUsers,
  sendMessage,
  getMessages,
};
