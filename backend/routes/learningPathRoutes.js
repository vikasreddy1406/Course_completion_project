import express from "express";
import { createLearningPath, getLearningPaths, assignLearningPathToEmployee, getEmployeeLearningPath } from "../controllers/learningPathController.js"

const router = express.Router();

router.route("/create-learningpath").post(createLearningPath)
router.route("/get-learningpath").get(getLearningPaths)
router.route("/assign-learningpath").post(assignLearningPathToEmployee)
router.route("/:employeeId/get-learningpath").get(getEmployeeLearningPath)

export default router;