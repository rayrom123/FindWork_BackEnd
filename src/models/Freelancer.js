const mongoose = require("mongoose");

const freelancerSchema = new mongoose.Schema(
  {
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },
    fname: { type: String },
    birthday: { type: Date },
    avatar: { type: String },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    education: {
      type: [
        {
          school: String,
          degree: String,
          startDate: String,
          endDate: String,
          description: String,
        },
      ],
      default: [],
    },
    project_done: { type: Number },
    phone: { type: String },
    experience: { type: String },
    provider: {
      type: String,
      enum: ["local", "facebook", "google"],
      default: "local",
    },
    email: { type: String, required: true, unique: true },
    location: { type: String },

    publicKey: { type: String }, // Thêm vào employerSchema và freelancerSchema
    encryptedPrivateKey: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("freelancer", freelancerSchema);
