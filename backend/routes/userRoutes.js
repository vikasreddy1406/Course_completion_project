import express from "express"
import { registerUser, loginUser } from "../controllers/userController.js"
import { getAssignedCourses,getCourseDetails,markModuleAsCompleted,getCourseCompletionStats, generateCertificate, submitQuiz, getQuiz } from "../controllers/courseController.js"
import { verifyJWT, verifyEmployee } from "../middlewares/authMiddleware.js";

const router = express.Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/get-courses").get(verifyJWT, verifyEmployee, getAssignedCourses);
router.route("/courses/:courseId").get(verifyJWT, verifyEmployee, getCourseDetails);
router.route("/courses/:courseId/modules/:moduleId").patch(verifyJWT, verifyEmployee, markModuleAsCompleted);
router.route("/stats/completion").get(verifyJWT, verifyEmployee, getCourseCompletionStats);
router.route("/certificate/:employeeId/:courseId").get(verifyJWT,verifyEmployee, generateCertificate);
router.route("/submit-quiz/:courseId").post(verifyJWT, verifyEmployee, submitQuiz)
router.route("/quiz/:courseId").get(getQuiz)

export default router