const Question = require('../models/Question');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const { generateInterviewQuestion } = require('../utils/claudeService');

const getNextQuestion = async (req, res, next) => {
    try {
        const { interviewId, currentScore } = req.body;
        const interview = await Interview.findOne({ _id: interviewId, user: req.user.id });
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
        if (interview.status === 'completed') return res.status(400).json({ success: false, message: 'Interview is already completed' });

        const existingQuestions = await Question.find({ interview: interviewId }).sort('questionNumber');
        if (existingQuestions.length >= 8) {
            return res.status(400).json({ success: false, message: 'Maximum questions reached' });
        }

        let resumeData = null;
        if (interview.resume) {
            const resume = await Resume.findById(interview.resume);
            if (resume) resumeData = resume.parsedData;
        }

        const previousQuestions = existingQuestions.map(q => q.text);
        const questionNumber = existingQuestions.length + 1;

        const questionData = await generateInterviewQuestion({
            role: interview.role,
            experienceLevel: interview.experienceLevel,
            mode: interview.mode,
            resumeData,
            previousQuestions,
            questionNumber,
            currentScore
        });

        const question = await Question.create({
            interview: interviewId,
            questionNumber,
            text: questionData.question,
            type: questionData.type || 'technical',
            difficulty: questionData.difficulty || 'medium',
            topic: questionData.topic || '',
            expectedKeywords: questionData.expectedKeywords || []
        });

        await Interview.findByIdAndUpdate(interviewId, { $inc: { totalQuestions: 1 } });

        res.json({
            success: true,
            question: { _id: question._id, text: question.text, type: question.type, difficulty: question.difficulty, topic: question.topic, questionNumber }
        });
    } catch (error) { next(error); }
};

const getInterviewQuestions = async (req, res, next) => {
    try {
        const interview = await Interview.findOne({ _id: req.params.interviewId, user: req.user.id });
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
        const questions = await Question.find({ interview: req.params.interviewId }).sort('questionNumber');
        res.json({ success: true, questions });
    } catch (error) { next(error); }
};

module.exports = { getNextQuestion, getInterviewQuestions };
