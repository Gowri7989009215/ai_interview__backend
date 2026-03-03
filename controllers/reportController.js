const Report = require('../models/Report');
const Interview = require('../models/Interview');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const { generateFinalReport } = require('../utils/claudeService');

const generateReport = async (req, res, next) => {
    try {
        const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

        // If report already exists, return it
        const existingReport = await Report.findOne({ interview: req.params.id });
        if (existingReport) return res.json({ success: true, report: existingReport });

        const answers = await Answer.find({ interview: req.params.id }).populate('question', 'text');
        if (answers.length === 0) return res.status(400).json({ success: false, message: 'No answers found for this interview' });

        const questionsAndAnswers = answers.map(a => ({
            question: a.question?.text || 'Question not found',
            answer: a.text,
            score: a.scores.total
        }));

        const avgScore = Math.round(answers.reduce((s, a) => s + a.scores.total, 0) / answers.length);
        const categoryAvg = {
            relevance: Math.round(answers.reduce((s, a) => s + a.scores.relevance, 0) / answers.length),
            technicalDepth: Math.round(answers.reduce((s, a) => s + a.scores.technicalDepth, 0) / answers.length),
            clarity: Math.round(answers.reduce((s, a) => s + a.scores.clarity, 0) / answers.length),
            communication: Math.round(answers.reduce((s, a) => s + a.scores.communication, 0) / answers.length)
        };

        const reportData = await generateFinalReport({
            role: interview.role,
            experienceLevel: interview.experienceLevel,
            mode: interview.mode,
            questionsAndAnswers,
            scores: { average: avgScore, ...categoryAvg }
        });

        const antiCheatFlags = interview.antiCheatFlags || [];
        const isSuspicious = antiCheatFlags.length >= 3;

        const report = await Report.create({
            interview: interview._id,
            user: req.user.id,
            overallScore: avgScore,
            categoryScores: categoryAvg,
            strengths: reportData.strengths || [],
            weaknesses: reportData.weaknesses || [],
            skillGaps: reportData.skillGaps || [],
            learningRecommendations: reportData.learningRecommendations || [],
            performanceSummary: reportData.performanceSummary || '',
            hiringRecommendation: reportData.hiringRecommendation || 'Maybe',
            antiCheatSummary: {
                flagsCount: antiCheatFlags.length,
                isSuspicious,
                details: antiCheatFlags.map(f => `${f.type}: ${f.details}`)
            }
        });

        // Update interview score
        await Interview.findByIdAndUpdate(req.params.id, { overallScore: avgScore, scores: categoryAvg });

        res.status(201).json({ success: true, report: { ...report.toObject(), interview } });
    } catch (error) { next(error); }
};

const getReport = async (req, res, next) => {
    try {
        const report = await Report.findOne({ interview: req.params.id, user: req.user.id }).populate('interview', 'role experienceLevel mode completedAt');
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        res.json({ success: true, report });
    } catch (error) { next(error); }
};

const getUserReports = async (req, res, next) => {
    try {
        const reports = await Report.find({ user: req.user.id }).populate('interview', 'role experienceLevel mode completedAt').sort('-createdAt');
        res.json({ success: true, reports });
    } catch (error) { next(error); }
};

module.exports = { generateReport, getReport, getUserReports };
