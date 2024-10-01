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
});

export const Course = mongoose.model('Course', courseSchema);
