const mongoose = require("mongoose")

const resultSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  score: Number,
  round: Number,
  submittedAt: Date
})

module.exports = mongoose.model("QuizResult", resultSchema)