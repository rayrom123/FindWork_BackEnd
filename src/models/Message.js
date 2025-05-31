const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receiverID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    textForReceiver: {
      type: String,
    },
    textForSender: {
      type: String,
    },
    file: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", MessageSchema);
