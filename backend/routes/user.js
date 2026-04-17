const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/user/profile
router.get('/profile', auth, async (req, res) => {
  res.json({ user: req.user });
});

// @route   PUT /api/user/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, role, experienceLevel, skills, resumeText } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (role) updates.role = role;
    if (experienceLevel) updates.experienceLevel = experienceLevel;
    if (skills !== undefined) updates.skills = skills;
    if (resumeText !== undefined) updates.resumeText = resumeText;

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json({ user, message: 'Profile updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// @route   PUT /api/user/password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password.' });
  }
});

module.exports = router;
