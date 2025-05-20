import bcrypt from "bcryptjs";
import { generatorToken } from "../utils/generatorToken.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";

//Sign UP
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });
    const token = generatorToken(newUser._id);
    res.json({
      success: true,
      userData: newUser,
      token,
      message: "Account created sucessfully!",
    });
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: err.message });
  }
};

//Login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({ sucess: false, message: "Missing Details" });
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.json({ success: false, message: "Invalid credentials!" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invaild credentials!" });
    }
    const token = generatorToken(userData._id);
    res.json({
      success: true,
      userData: userData,
      token,
      message: "Login sucessfully!",
    });
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: err.message });
  }
};

//controller to check if user is authenticated

export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

//controller to update user profile details

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;
    let updatedUser;
    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure + URL, bio, fullName },
        { new: true }
      );
    }
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: err.message });
  }
};
