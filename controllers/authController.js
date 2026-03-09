const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

exports.register = async (req,res)=>{

 const {username,email,password} = req.body

 const existing = await User.findOne({email})

 if(existing){
  return res.status(400).json({msg:"User already exists"})
 }

 const hashed = await bcrypt.hash(password,10)

 const user = new User({
  username,
  email,
  password: hashed
 })

 await user.save()

 res.json({msg:"User registered"})
}

exports.login = async (req,res)=>{

 const {email,password} = req.body

 const user = await User.findOne({email})

 if(!user){
  return res.status(400).json({msg:"User not found"})
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