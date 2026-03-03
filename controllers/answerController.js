const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Interview = require('../models/Interview');
const { evaluateAnswer } = require('../utils/claudeService');

const submitAnswer = async (req, res, next) => {
    try {
        const { interviewId, questionId, text, inputMethod, timeTaken, antiCheatData } = req.body;
        if (!interviewId || !questionId || !text) {
            return res.status(400).json({ success: false, message: 'interviewId, questionId, and text are required' });
        }

        const interview = await Interview.findOne({ _id: interviewId, user: req.user.id });
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

        const question = await Question.findOne({ _id: questionId, interview: interviewId });
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        // Check if already answered
        const existing = await Answer.findOne({ interview: interviewId, question: questionId });
        if (existing) return res.status(400).json({ success: false, message: 'Question already answered' });

        // Call AI to evaluate
        const evaluation = await evaluateAnswer({
            question: question.text,
            answer: text,
            role: interview.role,
            experienceLevel: interview.experienceLevel,
            mode: interview.mode
        });

        const scores = {
            relevance: Math.min(25, Math.max(0, evaluation.scores?.relevance || 0)),
            technicalDepth: Math.min(25, Math.max(0, evaluation.scores?.technicalDepth || 0)),
            clarity: Math.min(25, Math.max(0, evaluation.scores?.clarity || 0)),
            communication: Math.min(25, Math.max(0, evaluation.scores?.communication || 0)),
            total: Math.min(100, Math.max(0, evaluation.total || 0))
        };

        const answer = await Answer.create({
            interview: interviewId,
            question: questionId,
            user: req.user.id,
            text,
            inputMethod: inputMethod || 'text',
            timeTaken: timeTaken || 0,
            scores,
            feedback: {
                overall: evaluation.feedback?.overall || '',
                strengths: evaluation.feedback?.strengths || [],
                improvements: evaluation.feedback?.improvements || []
            },
            isEvaluated: true,
            antiCheatData: {
                copyPasteDetected: antiCheatData?.copyPasteDetected || false,
                tabSwitches: antiCheatData?.tabSwitches || 0
            }
        });

        // Mark question as answered
        await Question.findByIdAndUpdate(questionId, { isAnswered: true });
        await Interview.findByIdAndUpdate(interviewId, { $inc: { answeredQuestions: 1 } });

        res.status(201).json({ success: true, message: 'Answer submitted and evaluated', answer });
    } catch (error) { next(error); }
};

const getInterviewAnswers = async (req, res, next) => {
    try {
        const interview = await Interview.findOne({ _id: req.params.interviewId, user: req.user.id });
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
        const answers = await Answer.find({ interview: req.params.interviewId }).populate('question', 'text type difficulty questionNumber');
        res.json({ success: true, answers });
    } catch (error) { next(error); }
};

module.exports = { submitAnswer, getInterviewAnswers };
