import { Course } from '../models/Course.js';
import { CourseModule } from '../models/CourseModule.js';
import { CourseAssignment } from '../models/CourseAssignment.js';
import { User } from '../models/User.js';
import { CourseProgress } from '../models/CourseProgress.js';

const createCourse = async (req, res) => {
    try {
      const { title, description } = req.body;
  
      const newCourse = new Course({
        title,
        description,
      });
  
      await newCourse.save();
      res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (error) {
      res.status(500).json({ message: 'Error creating course', error });
    }
  };

  const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find(); 
        // if (!courses.length) {
        //     return res.status(201).json({ message: 'No courses found' });
        // }
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error });
    }
};


const updateCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.params;
  
      
      const modules = await CourseModule.find({ course_id: courseId });
  
      if (!modules || modules.length === 0) {
        return res.status(404).json({ message: 'No modules found for this course' });
      }
  
     
      const moduleCount = modules.length;
      const totalDuration = modules.reduce((sum, module) => sum + module.module_duration, 0);
  
     
      const course = await Course.findByIdAndUpdate(
        courseId,
        { modules: moduleCount, duration: totalDuration },
        { new: true }
      );
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.status(200).json({ message: 'Course updated successfully', course });
    } catch (error) {
      res.status(500).json({ message: 'Error updating course', error });
    }
  };


  const addModuleToCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const { module_title, module_content, module_duration } = req.body;
  
      const newModule = new CourseModule({
        course_id: courseId,
        module_title,
        module_content,
        module_duration
      });
  
      await newModule.save();
      res.status(201).json({ message: 'Module added successfully', module: newModule });
    } catch (error) {
      res.status(500).json({ message: 'Error adding module', error });
    }
  };

  const assignCourseToEmployee = async (req, res) => {
    try {
      const { courseId } = req.params;
      const { employee_ids } = req.body; 
  
      const assignments = await Promise.all(
        employee_ids.map(async (employee_id) => {
          const assignment = new CourseAssignment({
            employee_id,
            course_id: courseId,
          });
          return assignment.save();
        })
      );
  
      res.status(201).json({ message: 'Courses assigned successfully', assignments });
    } catch (error) {
      res.status(500).json({ message: 'Error assigning courses', error });
    }
  };

  const getEmployeePerformance = async (req, res) => {
    try {
      const employees = await User.find({ role: 'employee' }).select('name performance_score');
      const performanceData = await Promise.all(employees.map(async (employee) => {
        const progress = await CourseProgress.find({ employee_id: employee._id });
        const completionRate = progress.length > 0 
          ? progress.reduce((acc, curr) => acc + curr.completion_percentage, 0) / progress.length : 0;
  
        return {
          employee: employee.name,
          performance_score: employee.performance_score,
          completion_rate: completionRate
        };
      }));
      res.status(200).json(performanceData);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching performance data', error });
    }
  };

  const getAssignedCourses = async (req, res) => {
    try {
      const employeeId = req.user._id; 
      const assignments = await CourseAssignment.find({ employee_id: employeeId }).populate('course_id');
      res.status(200).json(assignments);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assigned courses', error });
    }
  };

  const getCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.params;
      const course = await Course.findById(courseId);
      const modules = await CourseModule.find({ course_id: courseId });
      const progress = await CourseProgress.findOne({
        employee_id: req.user._id,
        course_id: courseId,
      });
  
      res.status(200).json({
        course,
        modules,
        completion_percentage: progress ? progress.completion_percentage : 0
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching course details', error });
    }
  };

  const markModuleAsCompleted = async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
  
      const module = await CourseModule.findById(moduleId);
      if (!module) return res.status(404).json({ message: 'Module not found' });
  
      module.is_completed = true;
      await module.save();
  
      // Update course progress
      const modules = await CourseModule.find({ course_id: courseId });
      const completedModules = modules.filter((mod) => mod.is_completed).length;
      const completionPercentage = (completedModules / modules.length) * 100;
  
      await CourseProgress.findOneAndUpdate(
        { employee_id: req.user._id, course_id: courseId },
        { completion_percentage: completionPercentage },
        { upsert: true }
      );
  
      res.status(200).json({ message: 'Module marked as completed', completionPercentage });
    } catch (error) {
      res.status(500).json({ message: 'Error marking module as completed', error });
    }
  };

  const getCourseCompletionStats = async (req, res) => {
    try {
      const employeeId = req.user._id;
      const progress = await CourseProgress.find({ employee_id: employeeId });
      const totalCourses = progress.length;
      const completedCourses = progress.filter((p) => p.completion_percentage === 100).length;
  
      res.status(200).json({
        totalCourses,
        completedCourses,
        completionRate: totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching completion statistics', error });
    }
  };

  export {
    createCourse,
    getAllCourses,
    addModuleToCourse,
    assignCourseToEmployee,
    getEmployeePerformance,
    getCourseDetails,
    getAssignedCourses,
    getCourseCompletionStats,
    markModuleAsCompleted,
    updateCourseDetails,
  }