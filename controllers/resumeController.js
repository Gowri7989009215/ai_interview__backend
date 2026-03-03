const Resume = require('../models/Resume');
const { parsePDF } = require('../utils/pdfParser');
const { parseResumeWithClaude } = require('../utils/claudeService');
const fs = require('fs');

const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF file' });

        const pdfData = await parsePDF(req.file.path);
        if (!pdfData.text || pdfData.text.trim().length < 50) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Please upload a text-based PDF.' });
        }

        const parsedData = await parseResumeWithClaude(pdfData.text);

        const resume = await Resume.create({
            user: req.user.id,
            originalFileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            rawText: pdfData.text,
            parsedData
        });

        res.status(201).json({
            success: true,
            message: 'Resume uploaded and parsed successfully',
            resume: { id: resume._id, originalFileName: resume.originalFileName, parsedData: resume.parsedData, createdAt: resume.createdAt }
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        next(error);
    }
};

const getResumes = async (req, res, next) => {
    try {
        const resumes = await Resume.find({ user: req.user.id, isActive: true }).select('-rawText -filePath').sort('-createdAt');
        res.json({ success: true, resumes });
    } catch (error) { next(error); }
};

const getResume = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
        res.json({ success: true, resume });
    } catch (error) { next(error); }
};

const deleteResume = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
        resume.isActive = false;
        await resume.save();
        res.json({ success: true, message: 'Resume deleted successfully' });
    } catch (error) { next(error); }
};

module.exports = { uploadResume, getResumes, getResume, deleteResume };
