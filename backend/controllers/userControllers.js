import asyncHandler from "../middlewares/asyncHandler.js";
import user from "../models/userModel.js";
import bcrypt from "bcryptjs"
import createToken from "../utils/createToken.js"


const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new Error("Fill all inputs");
  }

  const userExists = await user.findOne({ email });

  if (userExists) {
    res.status(400).send("Already exists...Login");
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password,salt);
  const newUser = new user({ username, email, password:hashedPassword });

  try {
    await newUser.save();
    createToken(res,newUser._id)

    res
      .status(201)
      .json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      });
  } catch (error) {
    res.status(400).json({ error: "Invalid request", message: error.message });
  }
});

const loginUser = asyncHandler(async(req,res)=>{

  const {email,password} = req.body;

  const existingUser = await user.findOne({email});

  if(!existingUser){
    throw new Error("User Doesnt exist");
  }

  const validPassword = await bcrypt.compare(password,existingUser.password);

  if(!validPassword){
    throw new Error('Incorrect Password');
  }

  createToken(res,user._id);

  res
      .status(201)
      .json({

        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      });

      return;//Exit fn after sending responnse


})

const logoutUser = asyncHandler(async(req,res)=>{
  res.cookie('jwt','',{
    httpOnly:true,
    expires:new Date(0)
  });
  res.status(200).json({message:"Logged Out"});
})

const getAllUsers = asyncHandler(async(req,res,next)=>{

  const users = await user.find({});
  res.json(users)
})

export { createUser,loginUser,logoutUser,getAllUsers };
