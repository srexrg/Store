import asyncHandler from "../middlewares/asyncHandler.js";
import user from "../models/userModel.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new Error("Fill all inputs");
  }

  const userExists = await user.findOne({ email });

  if (userExists) {
    res.status(400).send("Already exists...Login");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new user({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    createToken(res, newUser._id);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid request", message: error.message });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;


  const existingUser = await user.findOne({ email });

  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (isPasswordValid) {
      createToken(res, existingUser._id);

      res.status(201).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      });
      return;
    }
  }
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await user.find({});
  res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const curruser = await user.findById(req.user._id);

  if (curruser) {
    res.json({
      _id: curruser._id,
      username: curruser.username,
      email: curruser.email,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const curruser = await user.findById(req.user._id);

  if (curruser) {
    curruser.username = req.body.username || curruser.username;
    curruser.email = req.body.email || curruser.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      curruser.password = hashedPassword;
    }

    const updated = await curruser.save();

    res.json({
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      isAdmin: updated.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
};
