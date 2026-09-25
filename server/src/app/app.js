import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "../routes/auth.route.js";
import userRoutes from "../routes/users.route.js";
import attendanceRoutes from "../routes/attendance.route.js";
import globleErrorHandler from "../middlewares/error.middelware.js";

const app = express();

app.use(morgan("dev"));
app.use(cors({
  origin: "process.env.FRONTEND_URL",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use(globleErrorHandler);

export default app;
