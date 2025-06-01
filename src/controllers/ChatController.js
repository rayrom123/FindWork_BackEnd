const freelancer = require("../models/Freelancer");
const employer = require("../models/Employer");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const { getIO } = require("../config/socket");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

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
      freelancer
        .find({ _id: { $in: userIds } })
        .select("username email publicKey"),
      employer
        .find({ _id: { $in: userIds } })
        .select("companyName email publicKey"),
    ]);

    // Combine both results và thêm trường publicKey cho mỗi user
    const chattedUsers = [
      ...freelancers.map((u) => u.toObject()),
      ...employers.map((u) => u.toObject()),
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
    const { textForReceiver, textForSender } = req.body;
    const { id: receiverID } = req.params;
    const senderID = req.user._id;

    let fileURL = null;
    if (req.file) {
      fileURL = `/uploads/${req.file.filename}`;
    }

    if (!textForReceiver && !textForSender && !fileURL) {
      return res
        .status(400)
        .json({ error: "Please provide a message or a file" });
    }

    const newMessage = new Message({
      senderID,
      receiverID,
      textForReceiver,
      textForSender,
      file: fileURL, // Đổi từ image sang file
    });

    await newMessage.save();

    const io = getIO();
    io.to(String(senderID)).emit("newMessage", newMessage);
    io.to(String(receiverID)).emit("newMessage", newMessage);

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
    console.log("Gửi tin nhắn thành công:", newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: receiverID } = req.params;
    const senderID = req.user._id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Lấy tin nhắn với phân trang
    const messages = await Message.find({
      $or: [
        { senderID, receiverID },
        { senderID: receiverID, receiverID: senderID },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit + 1); // Lấy thêm 1 tin nhắn để kiểm tra hasMore

    // Kiểm tra hasMore bằng cách so sánh số lượng tin nhắn nhận được
    const hasMore = messages.length > limit;
    
    // Nếu có thêm tin nhắn, bỏ tin nhắn thừa đi
    const messagesToSend = hasMore ? messages.slice(0, -1) : messages;

    res.status(200).json({
      messages: messagesToSend.reverse(),
      hasMore
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};



const getChatBotResponse = async (req, res) => {
  try {
    const PALM_API_URL = process.env.PALM_API_URL;
    const prompt = req.query.question;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    

    const response = await axios.post(PALM_API_URL, requestBody);

    console.log("Response from chatbot:", response.data.candidates[0].content.parts[0].text);

    res.json({ answer: response.data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.log("Lỗi khi lấy phản hồi từ chatbot be:", error);
    res.status(500).json({ error: error.message });
  }
};


// const PALM_API_URL = process.env.PALM_API_URL;

//     const requestBody = {
//       contents: [
//         {
//           parts: [
//             {
//               text: prompt,
//             },
//           ],
//         },
//       ],
//     };

//     //console.log("PaLM API URL:", PALM_API_URL);
//     const response = await axios.post(PALM_API_URL, requestBody);
//     const predictions = response.data.candidates;
//     if (predictions && predictions.length > 0) {
//       const firstCandidate = predictions[0];
//       if (
//         firstCandidate.content &&
//         firstCandidate.content.parts &&
//         firstCandidate.content.parts.length > 0
//       ) {
//         const generatedText = firstCandidate.content.parts[0].text;
//         //console.log("noi dung prompt: ", prompt);
//         console.log("Nội dung AI đã trả về:", generatedText);

//         // Extract JSON from the response
//         let predictedJobIds = [];
//         try {
//           // Remove markdown code block markers if present
//           const cleanText = generatedText
//             .replace(/```json\n?|\n?```/g, "")
//             .trim();
//           predictedJobIds = JSON.parse(cleanText);
//           console.log("Predicted Job IDs:", predictedJobIds);
//         } catch (e) {
//           console.error("Error parsing JSON from AI response:", e);
//           return res.status(500).json({
//             message: "Failed to parse AI response",
//             error: e.message,
//             rawResponse: generatedText,
//           });
//         }

module.exports = {
  getAllChattedUsers,
  sendMessage,
  getMessages,
  getChatBotResponse,
};
