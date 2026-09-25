import userModel from "../models/user.model.js";
import storageInstance from "../services/storageInstance.service.js";
import generateToken from "../utils/token.js";
import { appError } from "../utils/appError.js";
import jwt from "jsonwebtoken";

export const registerController = async (req, res) => {
  const { name, email, password, role, managerId } = req.body;
  const file = req.file;

  const user = await userModel.create({
    name,
    email,
    password,
    role,
    managerId,
    profile: file
      ? (await storageInstance(file.buffer, file.originalname)).url
      : null,
  });

  const accessToken = generateToken(user._id, "30min");
  const refreshToken = generateToken(user._id, "7d");

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 30 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    message: "user registered successfully",
  });
};

export const loginController = async (req, res) => {
  const { email, password, role } = req.body;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) throw new appError("user not found register first", 404);
  if (user.role !== role) throw new appError("access denied", 401);

  const isPassCorrect = user.comparePass(password);
  if (!isPassCorrect) throw new appError("invalid credentials", 401);

  const accessToken = generateToken(user._id, "30min");
  const refreshToken = generateToken(user._id, "7d");

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 30 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "login successful",
    user: { id: user._id, name: user.name, email: user.email, role: user.role, profile: user.profile },
  });
};

export const logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.status(200).json({
    success: true,
    message: "user logged out successfully",
  });
};

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new appError("user not found", 401);

  const verfiyToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await userModel.findById(verfiyToken.id);
  if (!user) throw new appError("user not found", 401);

  const accessToken = generateToken(user._id, "30min");
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 30 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "access token refreshed successfully",
  });
};

export const getManagersController = async (req, res) => {
  const managers = await userModel.find({ role: "manager" }).select("name email _id");
  return res.status(200).json({ success: true, managers });
};