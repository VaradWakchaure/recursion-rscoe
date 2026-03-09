const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["participant", "admin"],
    default: "participant"
  },
  currentRound: {
    type: Number,
    default: 1
  },
  score: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model("User", userSchema)