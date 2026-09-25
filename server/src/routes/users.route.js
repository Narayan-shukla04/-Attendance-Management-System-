import  express from "express"
import { authMiddelWare } from "../middlewares/authMiddleWare.js"
import {  deletUserController, getmeController, listTeamMember, listUsers } from "../controllers/users.controller.js"


const router = express.Router()



router.use(authMiddelWare)

router.get("/me",getmeController)
router.get("/list",listUsers)
router.delete("/:id",deletUserController)
router.get("/team",listTeamMember)




export default router