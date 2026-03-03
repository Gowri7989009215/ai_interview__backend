const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    inputMethod: { type: String, enum: ['voice', 'text', 'code'], default: 'text' },
    timeTaken: { type: Number, default: 0 },
    scores: {
        relevance: { type: Number, min: 0, max: 25, default: 0 },
        technicalDepth: { type: Number, min: 0, max: 25, default: 0 },
        clarity: { type: Number, min: 0, max: 25, default: 0 },
        communication: { type: Number, min: 0, max: 25, default: 0 },
        total: { type: Number, min: 0, max: 100, default: 0 }
    },
    feedback: {
        overall: { type: String, default: '' },
        improvements: [{ type: String }],
        strengths: [{ type: String }]
    },
    isEvaluated: { type: Boolean, default: false },
    antiCheatData: {
        copyPasteDetected: { type: Boolean, default: false },
        tabSwitches: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
