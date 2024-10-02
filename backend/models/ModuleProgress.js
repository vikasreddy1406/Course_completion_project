import mongoose from 'mongoose';

const moduleProgressSchema = new mongoose.Schema({
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
    module_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseModule',
        required: true,
    },
    is_completed: {
        type: Boolean,
        default: false,
    },
    completed_at: {
        type: Date,
    },
});

export const ModuleProgress = mongoose.model('ModuleProgress', moduleProgressSchema);
