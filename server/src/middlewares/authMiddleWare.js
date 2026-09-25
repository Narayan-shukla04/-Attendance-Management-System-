import jwt from "jsonwebtoken";
import { appError } from "../utils/appError.js";

export const authMiddelWare = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    throw new appError("user is not login ", 401);
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  if (!decodedToken) throw new appError("invalid token", 401);

  req.user = decodedToken.id;
  next();
};
