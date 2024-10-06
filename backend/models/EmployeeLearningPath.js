import mongoose from "mongoose";

const EmployeeLearningPathSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    learningPath: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningPath',
        required: true,
    },
    coursesCompleted: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started',
    },
    completionPercentage: {
        type: Number,
        default: 0,
    },
});

export const EmployeeLearningPath = mongoose.model('EmployeeLearningPath', EmployeeLearningPathSchema);
