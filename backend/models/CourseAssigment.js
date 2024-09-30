import mongoose from 'mongoose';

const courseAssignmentSchema = new mongoose.Schema({
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
  assigned_at: {
    type: Date,
    default: Date.now,
  },
});

export const CourseAssignment = mongoose.model('CourseAssignment', courseAssignmentSchema);

