import express from "express"
import { registerUser, loginUser, getAllEmployees } from "../controllers/userController.js"

const router = express.Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/getAllEmployees").get(getAllEmployees)

export default router