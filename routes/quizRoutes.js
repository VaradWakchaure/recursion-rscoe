const express = require("express")
const router = express.Router()

const auth = require("../middleware/authMiddleware")

const {
 startQuiz,
 getQuestions,
 submitQuiz,
 getLeaderboard,
 getMyResult,
 reportTabSwitch,
 saveAnswers
} = require("../controllers/quizController")

router.post("/start/:round", auth, startQuiz)

router.get("/questions/:round", auth, getQuestions)
router.get("/leaderboard/:round", auth, getLeaderboard)
router.get("/result/:round", auth, getMyResult)

router.post("/submit", auth, submitQuiz)
router.post("/tab-switch", auth, reportTabSwitch)
router.post("/save-answers", auth, saveAnswers)

module.exports = router