import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, 

    punchIn: { type: Date, required: true },
    punchOut: { type: Date },
    punchInPhoto: { type: String },
    punchOutPhoto: { type: String },

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      distance: { type: Number }, 
    },
    punchOutLocation: {
      lat: { type: Number },
      lng: { type: Number },
      distance: { type: Number },
    },

    totalHours: { type: Number, default: 0 }, 
    status: {
      type: String,
      enum: ["present", "incomplete", "completed"],
      default: "present",
    },

    
    validationStatus: {
      type: String,
      enum: ["pending", "valid", "invalid"],
      default: "pending",
    },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    remarks: { type: String },

    
    otRequested: { type: Boolean, default: false },
    otStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
    otApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    otHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);


attendanceSchema.index({employee: 1, date: 1}, { unique: true });

const attendanceModel = mongoose.model("Attendance", attendanceSchema);

export default attendanceModel;
