const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const User = require("../models/User")
const transporter = require("../config/mailer")

exports.register = async (req,res)=>{

 try{

  const {username,email,password} = req.body

  const existing = await User.findOne({email})

  if(existing){
   return res.status(400).json({msg:"User already exists"})
  }

  const hashed = await bcrypt.hash(password,10)

  // generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex")

  const user = new User({
   username,
   email,
   password: hashed,
   verificationToken,
   isVerified:false
  })

  await user.save()

  // create verification link
  const verificationLink =
   `${process.env.BASE_URL}/api/auth/verify/${verificationToken}`

  // send verification email
  await transporter.sendMail({
   from: process.env.EMAIL_USER,
   to: email,
   subject: "Verify your email - Recursion by RSCOE",
   html: `
    <h2>Email Verification</h2>
    <p>Please click the link below to verify your account:</p>
    <a href="${verificationLink}">Verify Email</a>
   `
  })

  res.json({msg:"Registration successful. Check your email to verify your account."})

 }
 catch(err){
  console.error(err)
  res.status(500).json({msg:"Server error"})
 }

}

exports.login = async (req,res)=>{

 try{

  const {email,password} = req.body

  const user = await User.findOne({email})

  if(!user){
   return res.status(400).json({msg:"User not found"})
  }

  // block login if email not verified
  if(!user.isVerified){
   return res.status(403).json({msg:"Please verify your email first"})
  }

  const match = await bcrypt.compare(password,user.password)

  if(!match){
   return res.status(400).json({msg:"Invalid password"})
  }

  const token = jwt.sign(
   {id:user._id, role:user.role},
   process.env.JWT_SECRET
  )

  res.json({token})

 }
 catch(err){
  console.error(err)
  res.status(500).json({msg:"Server error"})
 }

}

// email verification controller
exports.verifyEmail = async (req,res)=>{

 try{

  const user = await User.findOne({
   verificationToken:req.params.token
  })

  if(!user){
   return res.send(`
    <h2>Invalid or Expired Link</h2>
    <p>This verification link is not valid.</p>
   `)
  }

  user.isVerified = true
  user.verificationToken = null

  await user.save()

  res.send(`
  <html>
  <head>
    <title>Email Verified</title>
    <style>
      body{
        font-family: Arial;
        background:#f5f5f5;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
      }

      .card{
        background:white;
        padding:40px;
        border-radius:10px;
        text-align:center;
        box-shadow:0 5px 20px rgba(0,0,0,0.1);
      }

      h1{
        color:#2ecc71;
      }

      a{
        display:inline-block;
        margin-top:20px;
        padding:10px 20px;
        background:#3498db;
        color:white;
        text-decoration:none;
        border-radius:5px;
      }
    </style>
  </head>

  <body>
    <div class="card">
      <h1>✅ Email Verified</h1>
      <p>Your account has been successfully verified.</p>
      <p>You can now login and start the quiz.</p>

      <a href="/">Go to Login</a>
    </div>
  </body>
  </html>
  `)

 }
 catch(err){
  console.error(err)
  res.status(500).send("Server error")
 }

}