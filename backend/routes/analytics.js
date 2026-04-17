const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Interview = require('../models/Interview');

// @route   GET /api/analytics/dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId, status: 'completed' })
      .sort({ completedAt: 1 })
      .select('overallScore communicationRating technicalDepth role interviewType completedAt weakTopics strengths duration');

    if (interviews.length === 0) {
      return res.json({
        totalInterviews: 0,
        averageScore: 0,
        progressData: [],
        weakTopics: [],
        topStrengths: [],
        roleBreakdown: {},
        recentTrend: 'stable'
      });
    }

    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    // Progress over time
    const progressData = interviews.map(i => ({
      date: i.completedAt,
      score: i.overallScore,
      role: i.role,
      type: i.interviewType
    }));

    // Weak topics aggregation
    const topicCount = {};
    interviews.forEach(i => {
      (i.weakTopics || []).forEach(t => {
        topicCount[t] = (topicCount[t] || 0) + 1;
      });
    });
    const weakTopics = Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    // Strengths aggregation
    const strengthCount = {};
    interviews.forEach(i => {
      (i.strengths || []).forEach(s => {
        strengthCount[s] = (strengthCount[s] || 0) + 1;
      });
    });
    const topStrengths = Object.entries(strengthCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strength, count]) => ({ strength, count }));

    // Role breakdown
    const roleBreakdown = {};
    interviews.forEach(i => {
      if (!roleBreakdown[i.role]) roleBreakdown[i.role] = { count: 0, totalScore: 0 };
      roleBreakdown[i.role].count++;
      roleBreakdown[i.role].totalScore += i.overallScore;
    });
    Object.keys(roleBreakdown).forEach(role => {
      roleBreakdown[role].avgScore = Math.round(
        roleBreakdown[role].totalScore / roleBreakdown[role].count * 10
      ) / 10;
    });

    // Recent trend (last 3 vs previous 3)
    let recentTrend = 'stable';
    if (interviews.length >= 6) {
      const recent = avg(interviews.slice(-3).map(i => i.overallScore));
      const previous = avg(interviews.slice(-6, -3).map(i => i.overallScore));
      recentTrend = recent > previous + 0.5 ? 'improving' : recent < previous - 0.5 ? 'declining' : 'stable';
    }

    const scores = interviews.map(i => i.overallScore);
    const commScores = interviews.map(i => i.communicationRating);
    const techScores = interviews.map(i => i.technicalDepth);

    res.json({
      totalInterviews: interviews.length,
      averageScore: Math.round(avg(scores) * 10) / 10,
      averageCommunication: Math.round(avg(commScores) * 10) / 10,
      averageTechnical: Math.round(avg(techScores) * 10) / 10,
      bestScore: Math.max(...scores),
      progressData,
      weakTopics,
      topStrengths,
      roleBreakdown,
      recentTrend,
      totalTimeSpent: interviews.reduce((a, b) => a + (b.duration || 0), 0)
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics.' });
  }
});

module.exports = router;
