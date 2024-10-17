import mongoose from 'mongoose';

const quizProgressSchema = new mongoose.Schema({
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
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  completed_at: {
    type: Date,
  },
  is_passed: {
    type: Boolean,
    default: false,
  },
});

export const QuizProgress = mongoose.model('QuizProgress', quizProgressSchema);
