const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
    questionNumber: { type: Number, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['technical', 'behavioral', 'coding', 'situational', 'follow-up'], default: 'technical' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topic: { type: String, default: '' },
    expectedKeywords: [{ type: String }],
    isAnswered: { type: Boolean, default: false },
    isFollowUp: { type: Boolean, default: false },
    parentQuestion: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
