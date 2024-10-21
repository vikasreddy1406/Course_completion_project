import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
  },
  modules: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  tag: {
    type: String,
    enum: ['Web Development', 'Data Engineering', 'Data Science', 'Generative AI', 'DevOps', 'Cybersecurity', 'Mobile Development', 'UI/UX Design', 'Software Testing'],
    required: true,
  },
  imageUrl: {
    type: String, 
  },
});

export const Course = mongoose.model('Course', courseSchema);
