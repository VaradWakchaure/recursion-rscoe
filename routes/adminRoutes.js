const express = require("express")
const router = express.Router()

const auth = require("../middleware/authMiddleware")
const admin = require("../middleware/adminMiddleware")

const {
 addQuestion,
 getQuestions,
 deleteQuestion
} = require("../controllers/adminController")

router.post("/question", auth, admin, addQuestion)

router.get("/questions", auth, admin, getQuestions)

router.delete("/question/:id", auth, admin, deleteQuestion)

module.exports = router