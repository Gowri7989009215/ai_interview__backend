const { validationResult } = require('express-validator');
const User = require('../models/User');

const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

        const user = await User.create({ name, email, password });
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, totalInterviews: user.totalInterviews, averageScore: user.averageScore }
        });
    } catch (error) { next(error); }
};

const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        const token = user.getSignedJwtToken();

        res.json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, totalInterviews: user.totalInterviews, averageScore: user.averageScore }
        });
    } catch (error) { next(error); }
};

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, user });
    } catch (error) { next(error); }
};

const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true, runValidators: true });
        res.json({ success: true, user });
    } catch (error) { next(error); }
};

module.exports = { register, login, getMe, updateProfile };
