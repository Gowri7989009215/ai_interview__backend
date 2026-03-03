const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { generateInterviewQuestion } = require('../utils/claudeService');

const startInterview = async (req, res, next) => {
    try {
        const { role, experienceLevel, mode, resumeId } = req.body;
        if (!role || !experienceLevel || !mode) {
            return res.status(400).json({ success: false, message: 'Role, experience level, and mode are required' });
        }

        let resumeData = null;
        if (resumeId) {
            const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
            if (resume) resumeData = resume.parsedData;
        }

        const interview = await Interview.create({
            user: req.user.id,
            resume: resumeId || null,
            role, experienceLevel, mode,
            status: 'in-progress',
            startedAt: new Date()
        });

        const questionData = await generateInterviewQuestion({
            role, experienceLevel, mode, resumeData, previousQuestions: [], questionNumber: 1
        });

        const question = await Question.create({
            interview: interview._id,
            questionNumber: 1,
            text: questionData.question,
            type: questionData.type || 'technical',
            difficulty: questionData.difficulty || 'medium',
            topic: questionData.topic || '',
            expectedKeywords: questionData.expectedKeywords || []
        });

        await Interview.findByIdAndUpdate(interview._id, { totalQuestions: 1 });

        res.status(201).json({
            success: true,
            message: 'Interview started',
            interview: { _id: interview._id, role, experienceLevel, mode, status: interview.status, startedAt: interview.startedAt },
            question: { _id: question._id, text: question.text, type: question.type, difficulty: question.difficulty, topic: question.topic, questionNumber: 1 }
        });
    } catch (error) { next(error); }
};

const getInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id }).populate('resume', 'originalFileName parsedData');
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
        res.json({ success: true, interview });
    } catch (error) { next(error); }
};

const getUserInterviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const interviews = await Interview.find({ user: req.user.id })
            .sort('-createdAt').skip(skip).limit(limit).select('-antiCheatFlags');
        const total = await Interview.countDocuments({ user: req.user.id });
        res.json({ success: true, interviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
};

const getInterviewQuestions = async (req, res, next) => {
    try {
        const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
        const questions = await Question.find({ interview: req.params.id }).sort('questionNumber');
        res.json({ success: true, questions });
    } catch (error) { next(error); }
};

const completeInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

        const Answer = require('../models/Answer');
        const answers = await Answer.find({ interview: interview._id });
        const avgScore = answers.length > 0
            ? Math.round(answers.reduce((sum, a) => sum + (a.scores.total || 0), 0) / answers.length)
            : 0;

        const categoryAvg = answers.length > 0 ? {
            relevance: Math.round(answers.reduce((s, a) => s + a.scores.relevance, 0) / answers.length),
            technicalDepth: Math.round(answers.reduce((s, a) => s + a.scores.technicalDepth, 0) / answers.length),
            clarity: Math.round(answers.reduce((s, a) => s + a.scores.clarity, 0) / answers.length),
            communication: Math.round(answers.reduce((s, a) => s + a.scores.communication, 0) / answers.length)
        } : { relevance: 0, technicalDepth: 0, clarity: 0, communication: 0 };

        interview.status = 'completed';
        interview.completedAt = new Date();
        interview.overallScore = avgScore;
        interview.scores = categoryAvg;
        interview.answeredQuestions = answers.length;
        await interview.save();

        await User.findByIdAndUpdate(req.user.id, {
            $inc: { totalInterviews: 1 },
            $set: { averageScore: avgScore }
        });

        res.json({ success: true, message: 'Interview completed', interview });
    } catch (error) { next(error); }
};

const flagAntiCheat = async (req, res, next) => {
    try {
        const { type, details } = req.body;
        const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
        interview.antiCheatFlags.push({ type: type || 'tab-switch', details: details || '', timestamp: new Date() });
        await interview.save();
        res.json({ success: true, message: 'Flag recorded' });
    } catch (error) { next(error); }
};

module.exports = { startInterview, getInterview, getUserInterviews, getInterviewQuestions, completeInterview, flagAntiCheat };
