const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({

  question: {
    type: String,
    required: true
  },

  options: {
    type: [String],
    required: true
  },

  correctAnswer: {
    type: String,
    required: true
  },

  round: {
    type: Number,
    default: 1
  }

})

module.exports = mongoose.model("Question", questionSchema)