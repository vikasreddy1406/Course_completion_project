import { Course } from '../models/Course.js';
import { CourseModule } from '../models/CourseModule.js';
import { CourseAssignment } from '../models/CourseAssignment.js';
import { User } from '../models/User.js';
import { CourseProgress } from '../models/CourseProgress.js';
import { ModuleProgress } from '../models/ModuleProgress.js';
import { LearningPath } from '../models/LearningPath.js';
import { EmployeeLearningPath } from '../models/EmployeeLearningPath.js';

const createLearningPath = async (req, res) => {
    try {
        const { title, description, courses } = req.body;
        const newPath = new LearningPath({
            title,
            description,
            courses,
            totalCourses: courses.length,
        });
        await newPath.save();
        res.status(201).json(newPath);
    } catch (error) {
        res.status(500).json({ message: 'Error creating learning path', error });
    }
};

const getLearningPaths = async (req, res) => {
    try {
        const learningPaths = await LearningPath.find().populate('courses');
        res.status(200).json(learningPaths);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching learning paths', error });
    }
};

const assignLearningPathToEmployee = async (req, res) => {
    try {
        const { selectedEmployees, selectedLearningPaths } = req.body;

        
        const assignments = selectedEmployees.map(async (employeeId) => {
            const employeeAssignments = selectedLearningPaths.map(async (learningPathId) => {
                const assignment = new EmployeeLearningPath({
                    employee: employeeId,
                    learningPath: learningPathId,
                });
                await assignment.save();
                return assignment;
            });
            return Promise.all(employeeAssignments);  
        });

       
        await Promise.all(assignments);

        res.status(201).json({ message: 'Learning paths assigned successfully' });
    } catch (error) {
        console.error('Error assigning learning path:', error);
        res.status(500).json({ message: 'Error assigning learning path', error });
    }
};

const getEmployeeLearningPath = async (req, res) => {
    try {
        const { employeeId } = req.params;

       
        const employeeLearningPaths = await EmployeeLearningPath.find({ employee: employeeId })
            .populate({
                path: 'learningPath',
                populate: { path: 'courses', model: 'Course' },
            })
            .exec();
        const result = await Promise.all(
            employeeLearningPaths.map(async (employeeLearningPath) => {
                const learningPath = employeeLearningPath.learningPath;

               
                const coursesWithProgress = await Promise.all(
                    learningPath.courses.map(async (course) => {
                        
                        const courseAssignment = await CourseAssignment.findOne({
                            employee_id: employeeId,
                            course_id: course._id,
                        });

                        let courseCompletion = 0;

                       
                        if (courseAssignment) {
                            const courseProgress = await CourseProgress.findOne({
                                employee_id: employeeId,
                                course_id: course._id,
                            });

                            
                            if (courseProgress) {
                                courseCompletion = courseProgress.completion_percentage;
                            }
                        }

                        
                        return {
                            title: course.title,
                            duration: course.duration,
                            completionPercentage: courseCompletion,
                            assigned: !!courseAssignment, 
                        };
                    })
                );

               
                return {
                    learningPathTitle: learningPath.title,
                    description: learningPath.description,
                    courses: coursesWithProgress,
                };
            })
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching employee learning paths:', error);
        res.status(500).json({ message: 'Error fetching employee learning paths', error });
    }
};


export {
    createLearningPath,
    getLearningPaths,
    assignLearningPathToEmployee,
    getEmployeeLearningPath,
}