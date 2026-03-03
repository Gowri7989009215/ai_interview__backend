const User = require('../models/User');
const Interview = require('../models/Interview');
const Report = require('../models/Report');
const AdminLog = require('../models/AdminLog');

const getStats = async (req, res, next) => {
    try {
        const [totalUsers, totalInterviews, completedInterviews, totalReports] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Interview.countDocuments(),
            Interview.countDocuments({ status: 'completed' }),
            Report.countDocuments()
        ]);

        const avgScoreData = await Interview.aggregate([
            { $match: { status: 'completed', overallScore: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: '$overallScore' } } }
        ]);

        const interviewsByMode = await Interview.aggregate([
            { $group: { _id: '$mode', count: { $sum: 1 } } }
        ]);

        const topUsers = await User.find({ role: 'user', totalInterviews: { $gt: 0 } })
            .sort('-averageScore').limit(5).select('name averageScore totalInterviews');

        const recentInterviews = await Interview.find().sort('-createdAt').limit(10)
            .populate('user', 'name email').select('role mode status createdAt overallScore');

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalInterviews,
                completedInterviews,
                totalReports,
                avgScore: Math.round(avgScoreData[0]?.avg || 0),
                completionRate: totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0,
                interviewsByMode,
                topUsers,
                recentInterviews
            }
        });
    } catch (error) { next(error); }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort('-createdAt').select('-password');
        res.json({ success: true, users });
    } catch (error) { next(error); }
};

const getAllInterviews = async (req, res, next) => {
    try {
        const interviews = await Interview.find().sort('-createdAt').populate('user', 'name email').limit(100);
        res.json({ success: true, interviews });
    } catch (error) { next(error); }
};

const toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        await AdminLog.create({
            admin: req.user.id,
            action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            targetUser: user._id,
            details: { reason: 'Admin action' }
        });

        res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
    } catch (error) { next(error); }
};

module.exports = { getStats, getAllUsers, getAllInterviews, toggleUserStatus };
