const mongoose = require("mongoose")

const quizRoundSchema = new mongoose.Schema({

  round:{
    type:Number,
    unique:true
  },

  startTime:Date,

  endTime:Date

})

module.exports = mongoose.model("QuizRound", quizRoundSchema)