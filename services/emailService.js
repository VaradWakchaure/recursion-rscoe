const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
})

const sendResultEmail = async(email,score)=>{

  await transporter.sendMail({
    from:"Recursion RSCOE",
    to:email,
    subject:"Quiz Result",
    text:`Your score is ${score}`
  })

}

module.exports = sendResultEmail