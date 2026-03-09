const Question = require("../models/Question")
const User = require("../models/User")
const QuizSession = require("../models/QuizSession")
const QuizRound = require("../models/QuizRound")

const QUIZ_TIME_LIMIT = 15 * 60 * 1000 // 15 minutes
const QUESTION_LIMIT = 20



// AUTO SUBMIT HELPER
const autoSubmitQuiz = async (session, answers = []) => {

  let score = 0

  for(const ans of answers){

    if(!session.questions.includes(ans.questionId)){
      continue
    }

    const question = await Question.findById(ans.questionId)

    if(question && question.correctAnswer === ans.answer){
      score++
    }

  }

  session.submitted = true
  session.score = score

  await session.save()

  return score
}



// START QUIZ
exports.startQuiz = async (req,res)=>{

  const round = parseInt(req.params.round)

  const existing = await QuizSession.findOne({
    userId:req.user.id,
    round
  })

  // resume existing quiz
  if(existing){
    return res.json({
      msg:"Quiz already started",
      alreadyStarted:true,
      submitted: existing.submitted
    })
  }

  const questions = await Question.aggregate([
    { $match: { round } },
    { $sample: { size: QUESTION_LIMIT } }
  ])

  if(questions.length === 0){
    return res.status(400).json({
      msg:"No questions available for this round"
    })
  }

  const questionIds = questions.map(q => q._id)

  const quizRound = await QuizRound.findOne({ round })

  if(!quizRound){
    return res.status(404).json({msg:"Round not found"})
  }

  const now = new Date()

  if(now < quizRound.startTime){
    return res.status(400).json({
      msg:"Quiz has not started yet"
    })
  }

  if(now > quizRound.endTime){
    return res.status(400).json({
      msg:"Quiz time is over"
    })
  }

  const session = new QuizSession({
    userId:req.user.id,
    round,
    questions: questionIds,
    startedAt: new Date()
  })

  await session.save()

  res.json({msg:"Quiz started"})
}



// GET QUESTIONS
exports.getQuestions = async (req,res)=>{

  const round = parseInt(req.params.round)

  const session = await QuizSession.findOne({
    userId:req.user.id,
    round
  }).populate("questions")

  if(!session){
    return res.status(403).json({msg:"Start quiz first"})
  }

  const elapsed = Date.now() - session.startedAt

  // auto submit if timer expired
  if(elapsed > QUIZ_TIME_LIMIT){

    if(!session.submitted){
      await autoSubmitQuiz(session, session.answers || [])
    }

    return res.status(400).json({
      msg:"Quiz time expired"
    })
  }

  const safeQuestions = session.questions.map(q => ({
    _id:q._id,
    question:q.question,
    options:q.options
  }))

  const remainingTime = Math.max(QUIZ_TIME_LIMIT - elapsed, 0)

  res.json({
    remainingTime,
    questions: safeQuestions
  })
}



// SUBMIT QUIZ
exports.submitQuiz = async (req,res)=>{

  const {answers, round} = req.body

  const session = await QuizSession.findOne({
    userId:req.user.id,
    round
  })

  if(!session){
    return res.status(403).json({msg:"Quiz not started"})
  }

  if(session.submitted){
    return res.status(400).json({msg:"Quiz already submitted"})
  }

  const elapsed = Date.now() - session.startedAt

  if(elapsed > QUIZ_TIME_LIMIT){

    if(!session.submitted){
      await autoSubmitQuiz(session, answers)
    }

    return res.status(400).json({
      msg:"Time limit exceeded. Quiz closed."
    })
  }

  const questionIds = answers.map(a => a.questionId)

  const questions = await Question.find({
    _id: { $in: questionIds }
  })

  let score = 0

  const sessionQuestionIds = new Set(
    session.questions.map(q => q.toString())
  )

  const answeredQuestions = new Set()

  for(const ans of answers){

    const qid = ans.questionId

    if(!sessionQuestionIds.has(qid)){
      continue
    }

    if(answeredQuestions.has(qid)){
      continue
    }

    answeredQuestions.add(qid)

    const question = questions.find(
      q => q._id.toString() === qid
    )

    if(question && question.correctAnswer === ans.answer){
      score++
    }

  }

  session.submitted = true
  session.score = score
  await session.save()

  await User.findByIdAndUpdate(req.user.id,{
    score
  })

  res.json({
    msg:"Quiz submitted",
    score
  })
}



// LEADERBOARD
exports.getLeaderboard = async (req, res) => {

  const round = Number(req.params.round)

  try {

    const firstSession = await QuizSession.findOne({ round })
      .sort({ startedAt: 1 })

    if (!firstSession) {
      return res.status(404).json({ msg: "Quiz not started yet" })
    }

    const roundStart = firstSession.startedAt
    const unlockTime = new Date(roundStart.getTime() + QUIZ_TIME_LIMIT)

    if (Date.now() < unlockTime) {
      return res.status(403).json({
        msg: "Leaderboard will unlock after the quiz timer expires"
      })
    }

    const sessions = await QuizSession.find({
      round,
      submitted: true
    })
      .populate("userId", "username email")
      .sort({ score: -1, startedAt: 1 })

    const leaderboard = sessions.map((entry, index) => ({
      rank: index + 1,
      name: entry.userId.username,
      score: entry.score
    }))

    res.json(leaderboard)

  } catch (err) {
    res.status(500).json({ msg: "Error fetching leaderboard" })
  }

}



// MY RESULT
exports.getMyResult = async (req,res)=>{

  const round = Number(req.params.round)

  try{

    const session = await QuizSession.findOne({
      userId:req.user.id,
      round
    })

    if(!session){
      return res.status(404).json({msg:"Quiz session not found"})
    }

    if(!session.submitted){
      return res.status(400).json({msg:"Quiz not submitted yet"})
    }

    const sessions = await QuizSession.find({
      round,
      submitted:true
    }).sort({score:-1, startedAt:1})

    const rank = sessions.findIndex(
      s => s.userId.toString() === req.user.id
    ) + 1

    const participants = sessions.length

    res.json({
      score:session.score,
      rank,
      participants
    })

  }catch(err){
    res.status(500).json({msg:"Error fetching result"})
  }

}



// TAB SWITCH DETECTION
exports.reportTabSwitch = async (req,res)=>{

  const { round } = req.body

  try{

    const session = await QuizSession.findOne({
      userId:req.user.id,
      round
    })

    if(!session){
      return res.status(404).json({msg:"Quiz session not found"})
    }

    if(session.submitted){
      return res.status(400).json({msg:"Quiz already submitted"})
    }

    session.warnings = (session.warnings || 0) + 1

    if(session.warnings >= 3){

      await autoSubmitQuiz(session, session.answers || [])

      return res.json({
        msg:"Quiz auto-submitted due to tab switching"
      })
    }

    await session.save()

    res.json({
      msg:`Warning ${session.warnings}/3`
    })

  }catch(err){
    res.status(500).json({msg:"Error reporting tab switch"})
  }

}



// AUTO SAVE ANSWERS
exports.saveAnswers = async (req,res)=>{

  const {round, answers} = req.body

  try{

    const session = await QuizSession.findOne({
      userId:req.user.id,
      round
    })

    if(!session){
      return res.status(404).json({msg:"Quiz session not found"})
    }

    if(session.submitted){
      return res.status(400).json({msg:"Quiz already submitted"})
    }

    session.answers = answers

    await session.save()

    res.json({msg:"Answers saved"})

  }catch(err){
    res.status(500).json({msg:"Error saving answers"})
  }

}