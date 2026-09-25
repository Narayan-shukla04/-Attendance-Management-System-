import express from "express"
import { getManagersController, loginController, logout, registerController } from "../controllers/auth.controller.js"
import upload from "../config/multer.js"

const router = express.Router()

router.get("/managers", getManagersController)
router.post("/register", upload.single("profile"), registerController)
router.post("/login", loginController)
router.post("/logout", logout)

export default router