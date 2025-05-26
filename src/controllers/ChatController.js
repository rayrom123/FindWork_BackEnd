const freelancer = require("../models/Freelancer");
const employer = require("../models/Employer");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const { getIO } = require("../config/socket");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Thư mục lưu ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

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
      freelancer.find({ _id: { $in: userIds } }).select("username email"),
      employer.find({ _id: { $in: userIds } }).select("companyName email"),
    ]);

    // Combine both results và thêm trường publicKey cho mỗi user
    const chattedUsers = [
      ...freelancers.map((u) => ({
        ...u.toObject(),
        publicKey: u.email, // Freelancer luôn lấy email
      })),
      ...employers.map((u) => ({
        ...u.toObject(),
        publicKey: u.email || u.contactEmail, // Employer ưu tiên email, nếu không có thì lấy contactEmail
      })),
    ];

    console.log("Chatted users:", chattedUsers); // Debugging: Check chatted users

    res.status(200).json(chattedUsers);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverID } = req.params;
    const senderID = req.user._id;

    let imageURL = null;
    if (req.file) {
      // Nếu có file upload, lưu đường dẫn file (hoặc tên file) vào DB
      imageURL = `/uploads/${req.file.filename}`;
    }

    if (!text && !imageURL) {
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
    io.to(String(senderID)).emit("newMessage", newMessage);
    io.to(String(receiverID)).emit("newMessage", newMessage);

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
    console.log("Gửi tin nhắn thành công:", newMessage); // Thêm dòng này
  } catch (error) {
    console.error("Error sending message:", error);
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
