const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    overallScore: { type: Number, min: 0, max: 100, required: true },
    categoryScores: {
        relevance: { type: Number, default: 0 },
        technicalDepth: { type: Number, default: 0 },
        clarity: { type: Number, default: 0 },
        communication: { type: Number, default: 0 }
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    skillGaps: [{
        skill: String,
        severity: { type: String, enum: ['low', 'medium', 'high'] },
        recommendation: String
    }],
    learningRecommendations: [{
        topic: String,
        resources: [String],
        priority: { type: String, enum: ['low', 'medium', 'high'] }
    }],
    performanceSummary: { type: String, default: '' },
    hiringRecommendation: { type: String, enum: ['Strong Hire', 'Hire', 'Maybe', 'No Hire'], default: 'Maybe' },
    antiCheatSummary: {
        flagsCount: { type: Number, default: 0 },
        isSuspicious: { type: Boolean, default: false },
        details: [String]
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
