const Question = require("../models/Question")

exports.addQuestion = async (req,res)=>{

  const {question,options,correctAnswer,round} = req.body

  const q = new Question({
    question,
    options,
    correctAnswer,
    round
  })

  await q.save()

  res.json({msg:"Question added"})
}

exports.getQuestions = async (req,res)=>{

  const questions = await Question.find()

  res.json(questions)

}

exports.deleteQuestion = async (req,res)=>{

  const id = req.params.id

  await Question.findByIdAndDelete(id)

  res.json({msg:"Question deleted"})
}