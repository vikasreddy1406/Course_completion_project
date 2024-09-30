import mongoose from 'mongoose';

const courseModuleSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  module_title: {
    type: String,
    required: true,
  },
  module_content: {
    type: String,
    required: true,
  },
  module_duration: {
    type: Number,
    required: true,
  },
  is_completed: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const CourseModule = mongoose.model('CourseModule', courseModuleSchema);
