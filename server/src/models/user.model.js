import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["manager", "employee", "admin"],
      default: "employee",
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",

      index: true,
    },

    profile: { 
      type: String, 
      default: "" },
    
  },
  { timestamps: true },
);

userSchema.pre("save", function () {
  if (!this.isModified("password")) return;
  this.password = bcrypt.hashSync(this.password, 10);
});

userSchema.methods.comparePass = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
