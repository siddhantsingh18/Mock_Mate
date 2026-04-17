const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const Interview = require('../models/Interview');
const User = require('../models/User');
const { generateQuestion, generateFollowUp, evaluateAnswer, generateReport } = require('../services/groqService');

// @route   POST /api/interview/start
router.post('/start', auth, async (req, res) => {
  try {
    const { role, interviewType, experienceLevel, resumeText, adaptiveDifficulty } = req.body;

    const sessionId = uuidv4();
    const interview = new Interview({
      userId: req.userId,
      sessionId,
      role: role || req.user.role,
      interviewType: interviewType || 'mixed',
      experienceLevel: experienceLevel || req.user.experienceLevel,
      resumeUsed: !!resumeText,
      adaptiveDifficulty: adaptiveDifficulty !== false,
      currentDifficulty: experienceLevel === 'Senior' || experienceLevel === 'Lead' ? 'hard' :
                          experienceLevel === 'Mid-Level' ? 'medium' : 'easy',
      status: 'in-progress'
    });

    await interview.save();
    res.status(201).json({ sessionId, interviewId: interview._id, message: 'Interview session started!' });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ message: 'Failed to start interview session.' });
  }
});

// @route   POST /api/interview/:sessionId/question
router.post('/:sessionId/question', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { resumeText } = req.body;

    const interview = await Interview.findOne({ sessionId, userId: req.userId });
    if (!interview) return res.status(404).json({ message: 'Interview session not found.' });
    if (interview.status === 'completed') return res.status(400).json({ message: 'Interview already completed.' });

    const previousQuestions = interview.answers.map(a => a.question);

    // Adaptive difficulty
    let difficulty = interview.currentDifficulty;
    if (interview.adaptiveDifficulty && interview.answers.length >= 2) {
      const recentScores = interview.answers.slice(-2).map(a => a.feedback?.score || 5);
      const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      if (avgScore >= 8) difficulty = 'hard';
      else if (avgScore >= 5) difficulty = 'medium';
      else difficulty = 'easy';
      interview.currentDifficulty = difficulty;
    }

    const questionData = await generateQuestion({
      role: interview.role,
      interviewType: interview.interviewType,
      difficulty,
      previousQuestions,
      resumeText: resumeText || '',
      questionNumber: interview.answers.length + 1
    });

    const questionId = uuidv4();

    res.json({
      questionId,
      question: questionData.question,
      questionType: questionData.questionType || interview.interviewType,
      difficulty,
      hints: questionData.hints || [],
      timeLimit: questionData.timeLimit || 120,
      questionNumber: interview.answers.length + 1
    });
  } catch (error) {
    console.error('Generate question error:', error);
    res.status(500).json({ message: 'Failed to generate question. Check your Groq API key.' });
  }
});

// @route   POST /api/interview/:sessionId/answer
router.post('/:sessionId/answer', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, question, questionType, difficulty, answer, inputMode, timeSpent, expectedKeyPoints } = req.body;

    const interview = await Interview.findOne({ sessionId, userId: req.userId });
    if (!interview) return res.status(404).json({ message: 'Interview session not found.' });

    // Evaluate answer with Groq
    const feedback = await evaluateAnswer({
      question,
      answer,
      role: interview.role,
      questionType,
      difficulty,
      expectedKeyPoints: expectedKeyPoints || []
    });

    // Generate follow-up if score is low or answer needs elaboration
    let followUpQuestions = [];
    if (feedback.score < 7 && answer && answer.trim().length > 20) {
      const followUp = await generateFollowUp({
        question,
        answer,
        role: interview.role,
        interviewType: interview.interviewType
      });
      if (followUp) followUpQuestions = [followUp];
    }

    const answerDoc = {
      questionId,
      question,
      questionType: questionType || 'technical',
      difficulty: difficulty || 'medium',
      answer: answer || '',
      inputMode: inputMode || 'text',
      feedback: {
        score: feedback.score || 0,
        strengths: feedback.strengths || [],
        weaknesses: feedback.weaknesses || [],
        suggestedAnswer: feedback.suggestedAnswer || '',
        technicalDepth: feedback.technicalDepth || 0,
        communicationScore: feedback.communicationScore || 0,
        starMethodScore: feedback.starMethodScore || 0
      },
      timeSpent: timeSpent || 0,
      followUpQuestions
    };

    interview.answers.push(answerDoc);
    interview.answeredQuestions = interview.answers.length;
    await interview.save();

    res.json({
      feedback: answerDoc.feedback,
      followUpQuestions,
      keyPointsCovered: feedback.keyPointsCovered || [],
      missedKeyPoints: feedback.missedKeyPoints || [],
      improvementTip: feedback.improvementTip || '',
      message: 'Answer evaluated successfully!'
    });
  } catch (error) {
    console.error('Evaluate answer error:', error);
    res.status(500).json({ message: 'Failed to evaluate answer.' });
  }
});

// @route   POST /api/interview/:sessionId/complete
router.post('/:sessionId/complete', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const interview = await Interview.findOne({ sessionId, userId: req.userId });
    if (!interview) return res.status(404).json({ message: 'Interview session not found.' });

    if (interview.answers.length === 0) {
      return res.status(400).json({ message: 'No answers to evaluate.' });
    }

    // Generate final report
    const report = await generateReport({
      role: interview.role,
      answers: interview.answers,
      interviewType: interview.interviewType,
      experienceLevel: interview.experienceLevel
    });

    // Calculate overall scores
    const scores = interview.answers.map(a => a.feedback?.score || 0);
    const techScores = interview.answers.map(a => a.feedback?.technicalDepth || 0);
    const commScores = interview.answers.map(a => a.feedback?.communicationScore || 0);

    const avg = arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    interview.overallScore = Math.round(avg(scores) * 10) / 10;
    interview.communicationRating = Math.round(avg(commScores) * 10) / 10;
    interview.technicalDepth = Math.round(avg(techScores) * 10) / 10;
    interview.improvementTips = report.improvementTips || [];
    interview.weakTopics = report.weakTopics || [];
    interview.strengths = report.strengths || [];
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.duration = Math.round((Date.now() - interview.startedAt.getTime()) / 60000);

    await interview.save();

    // Update user stats
    const user = await User.findById(req.userId);
    if (user) {
      const allInterviews = await Interview.find({ userId: req.userId, status: 'completed' });
      user.totalInterviews = allInterviews.length;
      const allScores = allInterviews.map(i => i.overallScore);
      user.averageScore = Math.round(avg(allScores) * 10) / 10;
      await user.save();
    }

    res.json({
      overallScore: interview.overallScore,
      communicationRating: interview.communicationRating,
      technicalDepth: interview.technicalDepth,
      improvementTips: interview.improvementTips,
      weakTopics: interview.weakTopics,
      strengths: interview.strengths,
      overallAssessment: report.overallAssessment,
      hiringRecommendation: report.hiringRecommendation,
      studyResources: report.studyResources || [],
      nextSteps: report.nextSteps || [],
      totalQuestions: interview.answers.length,
      duration: interview.duration,
      message: 'Interview completed successfully!'
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ message: 'Failed to complete interview.' });
  }
});

// @route   GET /api/interview/history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const interviews = await Interview.find({ userId: req.userId, status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-answers');

    const total = await Interview.countDocuments({ userId: req.userId, status: 'completed' });

    res.json({
      interviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interview history.' });
  }
});

// @route   GET /api/interview/:sessionId
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ sessionId: req.params.sessionId, userId: req.userId });
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interview.' });
  }
});

module.exports = router;
