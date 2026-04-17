const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  question: { type: String, required: true },
  questionType: { type: String, enum: ['technical', 'behavioral', 'system-design', 'hr', 'mixed']},
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  answer: { type: String, default: '' },
  inputMode: { type: String, enum: ['text', 'voice', 'video'], default: 'text' },
  feedback: {
    score: { type: Number, min: 0, max: 10, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestedAnswer: { type: String, default: '' },
    technicalDepth: { type: Number, min: 0, max: 10, default: 0 },
    communicationScore: { type: Number, min: 0, max: 10, default: 0 },
    starMethodScore: { type: Number, min: 0, max: 10, default: 0 }
  },
  timeSpent: { type: Number, default: 0 }, // in seconds
  followUpQuestions: [{ type: String }]
});

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  interviewType: {
    type: String,
    enum: ['technical', 'behavioral', 'mixed', 'system-design', 'hr'],
    default: 'mixed'
  },
  experienceLevel: { type: String, default: 'Mid-Level' },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  answers: [answerSchema],
  totalQuestions: { type: Number, default: 0 },
  answeredQuestions: { type: Number, default: 0 },
  overallScore: { type: Number, min: 0, max: 10, default: 0 },
  communicationRating: { type: Number, min: 0, max: 10, default: 0 },
  technicalDepth: { type: Number, min: 0, max: 10, default: 0 },
  improvementTips: [{ type: String }],
  weakTopics: [{ type: String }],
  strengths: [{ type: String }],
  duration: { type: Number, default: 0 }, // in minutes
  resumeUsed: { type: Boolean, default: false },
  adaptiveDifficulty: { type: Boolean, default: true },
  currentDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
