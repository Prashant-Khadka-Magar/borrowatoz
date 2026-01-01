import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: `Not authorized, no token` });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: `Not authorized, user not found` });
    }

    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: `Not authorized, token failed` });
  }
});

export const admin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "user not available" });
  }

  if (req.user.roles != "ADMIN") {
    return res
      .status(401)
      .json({ success: false, message: "Forbidden, Admin only" });
  }

  return next();
});
