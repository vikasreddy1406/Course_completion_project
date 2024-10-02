import { Course } from '../models/Course.js';
import { CourseModule } from '../models/CourseModule.js';
import { CourseAssignment } from '../models/CourseAssignment.js';
import { User } from '../models/User.js';
import { CourseProgress } from '../models/CourseProgress.js';
import { ModuleProgress } from '../models/ModuleProgress.js';

const createCourse = async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : ''; // Handle the uploaded image

    const newCourse = new Course({
      title,
      description,
      tag,
      imageUrl, // Store the image URL
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
      const totalAssignedCourses = await CourseAssignment.countDocuments({ employee_id: employee._id });
      const completedCourses = await CourseProgress.countDocuments({
        employee_id: employee._id,
        completion_percentage: 100
      });

      const completionRate = totalAssignedCourses > 0
        ? (completedCourses / totalAssignedCourses) * 100
        : 0;

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

    const coursesWithProgress = await Promise.all(assignments.map(async (assignment) => {
      const totalModules = await CourseModule.countDocuments({ course_id: assignment.course_id._id });

      const completedModules = await ModuleProgress.countDocuments({
        employee_id: employeeId,
        course_id: assignment.course_id._id,
        is_completed: true
      });

      const courseProgress = await CourseProgress.findOne({
        employee_id: employeeId,
        course_id: assignment.course_id._id
      });

      const completionPercentage = courseProgress ? courseProgress.completion_percentage : 0;

      return {
        course_id: assignment.course_id,
        modulesCompleted: completedModules,
        totalModules: totalModules,
        completion_percentage: completionPercentage
      };
    }));

    res.status(200).json(coursesWithProgress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assigned courses', error });
  }
};


const getCourseDetails = async (req, res) => {
  try {
   
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    const modules = await CourseModule.find({ course_id: courseId });

    const moduleProgress = await ModuleProgress.find({
      employee_id: req.user._id,
      course_id: courseId,
    });

    // Check completion status for each module
    const modulesWithCompletion = modules.map(module => {
      const progress = moduleProgress.find(mp => String(mp.module_id) === String(module._id));
      return {
        ...module.toObject(),
        is_completed: progress ? progress.is_completed : false,
      };
    });

    // Calculate completion percentage based on module completion
    const completedModules = moduleProgress.filter(mp => mp.is_completed).length;
    const totalModules = modules.length;
    const completionPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    // Find or create course progress entry
    const progress = await CourseProgress.findOneAndUpdate(
      { employee_id: req.user._id, course_id: courseId },
      { completion_percentage: completionPercentage },
      { upsert: true, new: true }
    );

    res.status(200).json({
      course,
      modules: modulesWithCompletion,
      completion_percentage: progress.completion_percentage
    });
  } catch (error) {
 
    res.status(500).json({ message: 'Error fetching course details', error });
  }
};


const markModuleAsCompleted = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    // Check if the module exists
    const module = await CourseModule.findById(moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    // Check if the employee has already completed this module
    let moduleProgress = await ModuleProgress.findOne({
      employee_id: req.user._id,
      course_id: courseId,
      module_id: moduleId,
    });

    if (!moduleProgress) {
      // Create a new progress record if none exists
      moduleProgress = new ModuleProgress({
        employee_id: req.user._id,
        course_id: courseId,
        module_id: moduleId,
        is_completed: true,
        completed_at: new Date(),
      });
    } else {
      // If progress exists, update it
      moduleProgress.is_completed = true;
      moduleProgress.completed_at = new Date();
    }

    await moduleProgress.save();

    // Calculate updated course completion percentage for the employee
    const allModules = await CourseModule.find({ course_id: courseId });
    const completedModules = await ModuleProgress.find({
      employee_id: req.user._id,
      course_id: courseId,
      is_completed: true,
    });

    const completionPercentage = (completedModules.length / allModules.length) * 100;

    // Update course progress
    await CourseProgress.findOneAndUpdate(
      { employee_id: req.user._id, course_id: courseId },
      { completion_percentage: completionPercentage },
      { upsert: true }
    );

    res.status(200).json({
      message: 'Module marked as completed',
      completionPercentage,
      is_completed: moduleProgress.is_completed
    });
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
    const completionRate = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

    res.status(200).json({
      totalCourses,
      completedCourses,
      completionRate,
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