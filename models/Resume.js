const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalFileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    rawText: { type: String, default: '' },
    parsedData: {
        skills: [{ type: String, trim: true }],
        experience: [{ company: String, role: String, duration: String, description: String }],
        projects: [{ name: String, description: String, technologies: [String] }],
        education: [{ institution: String, degree: String, year: String }],
        summary: { type: String, default: '' }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
