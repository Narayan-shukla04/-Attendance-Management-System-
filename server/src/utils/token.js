import jwt from "jsonwebtoken";

const generateToken = (id, time) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: time,
  });
};

export default generateToken;
