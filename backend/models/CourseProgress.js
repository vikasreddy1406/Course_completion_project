import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  completion_percentage: {
    type: Number,  
    default: 0,
  },
  completed_at: {
    type: Date,
  },
});

export const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);

