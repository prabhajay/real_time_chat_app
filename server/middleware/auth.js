import jwt from "jsonwebtoken";
import User from "../models/User.js"; 

//Middleware toprotect routes
/*
const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.json({ success: false, message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: err.message });
  }
};*/

const protectRoute = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

  /*
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    console.log(token);
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Find user by decoded userId
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ success: false, message: "Unauthorized: " + err.message });
  }*/


//controller to check if user is authenticated

export const checkAuth = async(req, res) => {
  //res.json({ success: true, user: req.user });
  const user = await User.findById(req.user.userId);
  res.json({ success: true, user });
};

export default protectRoute;
