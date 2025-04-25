const { text } = require("body-parser");
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
    text: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", MessageSchema);
