import express from "express";
import {
  createCourse,
  addModuleToCourse,
  assignCourseToEmployee,
  getEmployeePerformance,
  getAllCourses,
  updateCourseDetails,
} from "../controllers/courseController.js";
import { verifyJWT, verifyAdmin } from "../middlewares/authMiddleware.js";
import { getAllEmployees } from "../controllers/userController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.route("/getAllEmployees").get(verifyJWT, verifyAdmin, getAllEmployees)
router.route("/create-courses").post(verifyJWT, verifyAdmin, upload.single('image'), createCourse);
router.route("/get-courses").get(getAllCourses);
router.route('/courses/:courseId/update-details').put(updateCourseDetails);
router.route("/courses/:courseId/add-modules").post(verifyJWT, verifyAdmin, addModuleToCourse);
router.route("/courses/:courseId/assign").post(verifyJWT, verifyAdmin, assignCourseToEmployee);
router.route("/performance").get(verifyJWT, verifyAdmin, getEmployeePerformance);

export default router;