const mongoose = require("mongoose")

const quizSessionSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  round:{
    type:Number,
    required:true
  },

  questions:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Question"
  }],

  answers:{
    type:[{
      questionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Question"
      },
      answer:String
    }],
    default:[]
  },

  startedAt:{
    type:Date,
    default:Date.now
  },

  submitted:{
    type:Boolean,
    default:false
  },

  score:{
    type:Number,
    default:0
  },

  warnings:{
    type:Number,
    default:0
  }

},{timestamps:true})

quizSessionSchema.index({ userId: 1, round: 1 }, { unique: true })

module.exports = mongoose.model("QuizSession", quizSessionSchema)