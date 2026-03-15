require("dotenv").config()
console.log("BASE_URL:", process.env.BASE_URL)

const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

const authRoutes = require("./routes/authRoutes")
const quizRoutes = require("./routes/quizRoutes")
const adminRoutes = require("./routes/adminRoutes")

const app = express()

connectDB()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

app.use("/api/auth", authRoutes)
app.use("/api/quiz", quizRoutes)
app.use("/api/admin", adminRoutes)

app.get("/", (req,res)=>{
  res.sendFile(__dirname + "/public/login.html")
})

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`)
})