import attendanceModel from "../models/attendence.model.js";
import userModel from "../models/user.model.js";
import { appError } from "../utils/appError.js";
import { checkInLocation } from "../utils/geo.js";
import storageInstance from "../services/storageInstance.service.js";

const todayStr = () => new Date().toLocaleDateString("en-CA");

export const punchInController = async (req, res) => {
  const { lat, lng } = req.body;
  const file = req.file;
  if (!file) throw new appError("selfie photo is required to punch in", 400);
  if (!lat || !lng) throw new appError("location coordinates required to punch in", 400);

  const date = todayStr();
  const exists = await attendanceModel.findOne({ employeeId: req.user, date });
  if (exists) throw new appError("already checked in today", 400);

  const { allowed, distance, message } = checkInLocation(lat, lng);
  if (!allowed) return res.status(400).json({ success: false, message });

  const uploadRes = await storageInstance(file.buffer, file.originalname);

  const attendance = await attendanceModel.create({
    employeeId: req.user,
    date,
    punchIn: new Date(),
    location: { lat: Number(lat), lng: Number(lng), distance },
    punchInPhoto: uploadRes?.url,
  });

  return res.status(200).json({ success: true, attendance });
};

export const punchOutController = async (req, res) => {
  const { lat, lng } = req.body;
  const file = req.file;
  if (!file) throw new appError("selfie photo is required to punch out", 400);
  if (!lat || !lng) throw new appError("location coordinates required to punch out", 400);

  const attendance = await attendanceModel.findOne({
    employeeId: req.user,
    date: todayStr(),
  });

  if (!attendance) throw new appError("not checked in today", 400);
  if (attendance.punchOut) throw new appError("already punched out", 400);

  const { allowed, distance, message } = checkInLocation(lat, lng);
  if (!allowed) return res.status(400).json({ success: false, message });

  const uploadRes = await storageInstance(file.buffer, file.originalname);

  const punchOut = new Date();
  attendance.punchOut = punchOut;
  attendance.punchOutPhoto = uploadRes?.url;
  attendance.punchOutLocation = { lat: Number(lat), lng: Number(lng), distance };
  attendance.totalHours = (punchOut - new Date(attendance.punchIn)) / 3600000;
  attendance.status = attendance.totalHours >= 8 ? "completed" : "incomplete";

  await attendance.save();
  res.status(200).json({ success: true, message: "checked out", attendance });
};

export const myAttendanceController = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const records = await attendanceModel
    .find({ employeeId: req.user })
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, records, page: Number(page) });
};

export const teamAttendanceController = async (req, res) => {
  const { from, to, page = 1, limit = 10 } = req.query;

  const user = await userModel.findById(req.user);
  if (!user || user.role !== "manager") throw new appError("unauthorized", 403);

  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const records = await attendanceModel
    .find(filter)
    .populate({ path: "employeeId", match: { managerId: req.user }, select: "name email" })
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    records: records.filter((r) => r.employeeId),
  });
};

export const allAttendanceController = async (req, res) => {
  const { from, to, page = 1, limit = 10 } = req.query;

  const user = await userModel.findById(req.user);
  if (!user || user.role !== "admin") throw new appError("unauthorized", 403);

  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const records = await attendanceModel
    .find(filter)
    .populate("employeeId", "name email role")
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await attendanceModel.countDocuments(filter);
  res.status(200).json({ success: true, records, total, page: Number(page) });
};

export const validateAttendance = async (req, res) => {
  const user = await userModel.findById(req.user);
  if (!user || user.role === "employee") throw new appError("unauthorized", 403);

  const { validationStatus, remarks } = req.body;
  if (validationStatus !== "valid" && validationStatus !== "invalid")
    throw new appError("validationStatus must be 'valid' or 'invalid'", 400);

  const record = await attendanceModel.findByIdAndUpdate(
    req.params.id,
    { validationStatus, remarks, validatedBy: req.user },
    { new: true }
  );
  if (!record) throw new appError("Record not found", 404);
  res.status(200).json({ success: true, record });
};

export const requestOTController = async (req, res) => {
  const record = await attendanceModel.findOne({
    _id: req.params.id,
    employeeId: req.user,
  });
  if (!record) throw new appError("Record not found", 404);
  if (record.otStatus !== "none") throw new appError("OT already requested", 400);

  record.otRequested = true;
  record.otStatus = "pending";
  await record.save();
  res.status(200).json({ success: true, record });
};

export const otDecisionController = async (req, res) => {
  const user = await userModel.findById(req.user);
  if (!user || user.role === "employee") throw new appError("unauthorized", 403);

  const { decision, otHours } = req.body;
  if (decision !== "approved" && decision !== "rejected")
    throw new appError("decision must be 'approved' or 'rejected'", 400);

  const record = await attendanceModel.findById(req.params.id);
  if (!record) throw new appError("Record not found", 404);
  if (record.otStatus !== "pending") throw new appError("No pending OT request", 400);

  record.otStatus = decision;
  record.otApprovedBy = req.user;
  if (decision === "approved" && otHours) record.otHours = otHours;
  await record.save();
  res.status(200).json({ success: true, record });
};

export const reportController = async (req, res) => {
  const { date } = req.query;
  const user = await userModel.findById(req.user);
  if (!user) throw new appError("unauthorized", 401);

  const filter = { date: date || todayStr() };
  if (user.role === "employee") filter.employeeId = req.user;

  const records = await attendanceModel
    .find(filter)
    .populate("employeeId", "name email role managerId");

  const result =
    user.role === "manager"
      ? records.filter((r) => r.employeeId?.managerId?.toString() === req.user.toString())
      : records;

  res.status(200).json({ success: true, date: filter.date, records: result });
};
