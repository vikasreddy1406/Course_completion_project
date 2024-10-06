import mongoose from 'mongoose';


const LearningPathSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    }],
    totalCourses: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const LearningPath = mongoose.model('LearningPath', LearningPathSchema);
