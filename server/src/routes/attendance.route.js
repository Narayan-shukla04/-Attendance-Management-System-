import express from "express"
import { authMiddelWare } from "../middlewares/authMiddleWare.js"
import { allAttendanceController, myAttendanceController, otDecisionController, punchInController, punchOutController, reportController, requestOTController, teamAttendanceController, validateAttendance } from "../controllers/attendence.controller.js"
import upload from "../config/multer.js"

const router = express.Router()
router.use(authMiddelWare)

router.post("/check-in",    upload.single("file"), punchInController)
router.post("/check-out",   upload.single("file"), punchOutController)
router.get("/my-attendance",    myAttendanceController)   
router.get("/team-attendance",  teamAttendanceController) 
router.get("/all-attendance",   allAttendanceController)  
router.post("/validate/:id",    validateAttendance)
router.post("/request-ot/:id",  requestOTController)
router.post("/ot-decision/:id", otDecisionController)
router.get("/report",           reportController)

export default router