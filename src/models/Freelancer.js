const mongoose = require("mongoose");

const FreelancerSchema = new mongoose.Schema({
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fname: String,
  birthday: Date,
  image: String,
  avatar: String,
  project_done: {
    type: Number,
    default: 0,
  },
  phone: String,
  experience: String,
  provider: {
    type: String,
    enum: ["local", "facebook"],
    default: "local",
  },
});

module.exports = mongoose.model("Freelancer", FreelancerSchema);
