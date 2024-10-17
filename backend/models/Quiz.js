import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  questions: [
    {
      question_text: {
        type: String,
        required: true,
      },
      options: [
        {
          option_text: {
            type: String,
            required: true,
          },
          is_correct: {
            type: Boolean,
            required: true,
          },
        },
      ],
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const Quiz = mongoose.model('Quiz', quizSchema);