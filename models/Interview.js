const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
    role: { type: String, required: true, trim: true },
    experienceLevel: { type: String, enum: ['fresher', 'junior', 'mid', 'senior', 'lead'], required: true },
    mode: { type: String, enum: ['Technical', 'HR', 'Coding', 'Mixed'], required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'abandoned'], default: 'pending' },
    totalQuestions: { type: Number, default: 0 },
    answeredQuestions: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    scores: {
        relevance: { type: Number, default: 0 },
        technicalDepth: { type: Number, default: 0 },
        clarity: { type: Number, default: 0 },
        communication: { type: Number, default: 0 }
    },
    antiCheatFlags: [{
        type: { type: String, enum: ['tab-switch', 'copy-paste', 'time-exceeded'] },
        timestamp: { type: Date, default: Date.now },
        details: String
    }],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    duration: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
