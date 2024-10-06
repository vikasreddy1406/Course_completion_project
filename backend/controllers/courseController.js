import { Course } from '../models/Course.js';
import { CourseModule } from '../models/CourseModule.js';
import { CourseAssignment } from '../models/CourseAssignment.js';
import { User } from '../models/User.js';
import { CourseProgress } from '../models/CourseProgress.js';
import { ModuleProgress } from '../models/ModuleProgress.js';
import PDFDocument from 'pdfkit';

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

      const existingAssignments = await CourseAssignment.find({
        course_id: courseId,
        employee_id: { $in: employee_ids },
      }).select('employee_id');

      const assignedEmployeeIds = existingAssignments.map(assignment => assignment.employee_id.toString());

      const employeesToAssign = employee_ids.filter(id => !assignedEmployeeIds.includes(id));

      if (employeesToAssign.length === 0) {
        return res.status(200).json({ message: 'All selected employees already assigned to this course.' });
      }

      const assignments = await Promise.all(
        employeesToAssign.map(async (employee_id) => {
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
    const employees = await User.find({ role: 'employee' }).select('name email designation performance_score');

    const performanceData = await Promise.all(employees.map(async (employee) => {
      const totalAssignedCourses = await CourseAssignment.countDocuments({ employee_id: employee._id });
      const completedCourses = await CourseProgress.countDocuments({
        employee_id: employee._id,
        completion_percentage: 100
      });

      const performance_score = totalAssignedCourses > 0
        ? (completedCourses / totalAssignedCourses) * 100
        : 0;

      return {
        employee: employee.name,
        email: employee.email, 
        designation: employee.designation, 
        total_courses_assigned: totalAssignedCourses,
        courses_completed: completedCourses,
        performance_score: performance_score
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

    // Fetch all courses assigned to the employee
    const assignedCourses = await CourseAssignment.find({ employee_id: employeeId }).select('course_id');
    const totalCourses = assignedCourses.length;

    // Fetch course progress for the employee
    const courseProgress = await CourseProgress.find({ employee_id: employeeId }).select('completion_percentage course_id');

    // Map of course_id to its completion percentage for quick lookup
    const progressMap = new Map(courseProgress.map(p => [p.course_id.toString(), p.completion_percentage]));

    // Count completed and total courses
    let completedCourses = 0;
    assignedCourses.forEach((assignment) => {
      const courseIdStr = assignment.course_id.toString();
      if (progressMap.get(courseIdStr) === 100) {
        completedCourses += 1;
      }
    });

    // Calculate completion rate
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


const generateCertificate = async (req, res) => {
  const { employeeId, courseId } = req.params;

  try {
    // Fetch employee and course data
    const employee = await User.findById(employeeId);
    const course = await Course.findById(courseId);

    // Check if employee or course exists
    if (!employee || !course) {
      return res.status(404).send('Employee or course not found');
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the filename for the certificate
    const filename = `${employee.name}-certificate.pdf`;

    // Set headers to make it downloadable
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add certificate content
    doc.fontSize(25).text('Certificate of Completion', { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(18).text(`This is to certify that`, { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(22).text(`${employee.name}`, { align: 'center', underline: true });

    doc.moveDown(1);
    doc.fontSize(18).text(`with the designation of ${employee.designation}`, { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(18).text(`has successfully completed the course`, { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(22).text(`${course.title}`, { align: 'center', underline: true });

    doc.moveDown(2);
    doc.fontSize(14).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

    // Finalize the PDF document
    doc.end();
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).send('Server error');
  }
};

const getCourseStats = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const assignedCount = await CourseAssignment.countDocuments({ course_id: courseId });

    const completedCount = await CourseProgress.countDocuments({
      course_id: courseId,
      completion_percentage: 100,
    });

    res.status(200).json({ assignedCount, completedCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course statistics', error });
  }
};

const getEmployeeCourses = async (req, res) => {
  try {
    // Fetch all employees
    const employees = await User.find({ role: 'employee' }).select('_id name email designation');

    const employeeCourses = await Promise.all(employees.map(async (employee) => {
      // Find the courses assigned to the employee
      const assignments = await CourseAssignment.find({ employee_id: employee._id }).populate('course_id');

      const coursesWithProgress = await Promise.all(assignments.map(async (assignment) => {
        const totalModules = await CourseModule.countDocuments({ course_id: assignment.course_id._id });

        const completedModules = await ModuleProgress.countDocuments({
          employee_id: employee._id,
          course_id: assignment.course_id._id,
          is_completed: true
        });

        const courseProgress = await CourseProgress.findOne({
          employee_id: employee._id,
          course_id: assignment.course_id._id
        });

        const completionPercentage = courseProgress ? courseProgress.completion_percentage : 0;
        const courseStatus = completedModules === totalModules ? 'Completed' : 'In Progress';

        return {
          course_id: assignment.course_id._id,
          course_title: assignment.course_id.title,
          course_tag: assignment.course_id.tag, 
          totalModules,
          modulesCompleted: completedModules,
          status: courseStatus,
          completion_percentage: completionPercentage,
        };
      }));

      const totalCourses = coursesWithProgress.length;
      const completedCourses = coursesWithProgress.filter(course => course.status === 'Completed').length;
      const performanceScore = (completedCourses / totalCourses) * 100;

      return {
        employee_id: employee._id,
        name: employee.name,
        designation: employee.designation,
        email: employee.email,
        totalCourses,
        completedCourses,
        performanceScore,
        courses: coursesWithProgress,
      };
    }));

    res.status(200).json(employeeCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee course details', error });
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
  generateCertificate,
  getCourseStats,
  getEmployeeCourses,
  }