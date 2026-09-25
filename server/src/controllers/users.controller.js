import userModel from "../models/user.model.js";
import { appError } from "../utils/appError.js";

export const getmeController = async (req, res) => {
  const user = await userModel.findById(req.user);
  if (!user) throw new appError("user not found ", 404);

  return res.status(200).json({
    success: true,
    user,
  });
};

export const listUsers = async (req, res) => {
  const users = await userModel.find().populate("managerId", "name email");
  res.status(200).json({ success: true, users });
};

export const deletUserController = async (req, res) => {
  const id = req.params.id;

  const user = await userModel.findById(id);
  if (!user) throw new appError("user not found ", 404);
  if (user.role === "admin") throw new appError("admin can't be deleted", 400);

  await userModel.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "deleted",
  });
};

export const listTeamMember = async (req, res) => {
  const user = await userModel.find({ managerId: req.user });

  return res.status(200).json({
    success: true,
    user,
  });
};