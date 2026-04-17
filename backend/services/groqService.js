require('dotenv').config();

const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate interview questions based on role, type, difficulty, and optional resume
 */
async function generateQuestion(params) {
  const { role, interviewType, difficulty, previousQuestions = [], resumeText = '', questionNumber = 1 } = params;

  const prevQuestionsText = previousQuestions.length > 0
    ? `\nPrevious questions asked (DO NOT repeat these):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  const resumeContext = resumeText
    ? `\nCandidate's resume/background:\n${resumeText.substring(0, 1000)}\nGenerate questions relevant to their experience.`
    : '';

  const typeInstructions = {
    technical: 'Focus on coding, algorithms, data structures, system concepts, and technical problem-solving.',
    behavioral: 'Focus on STAR-method behavioral questions about past experiences, leadership, teamwork, conflict resolution.',
    'system-design': 'Focus on designing scalable systems, architecture, databases, APIs, and infrastructure.',
    hr: 'Focus on career goals, salary expectations, company culture fit, strengths, weaknesses.',
    mixed: 'Mix of technical and behavioral questions appropriate for the role.'
  };

  const prompt = `You are an expert ${role} interviewer at a top tech company (FAANG level).
Generate ONE interview question for a ${difficulty} difficulty ${interviewType} interview for question #${questionNumber}.
Role: ${role}
Type: ${interviewType} - ${typeInstructions[interviewType] || typeInstructions.mixed}
Difficulty: ${difficulty}${resumeContext}${prevQuestionsText}

Respond in this EXACT JSON format:
{
  "question": "The interview question here",
  "questionType": "${interviewType === 'mixed' ? 'technical or behavioral' : interviewType}",
  "difficulty": "${difficulty}",
  "hints": ["hint 1", "hint 2"],
  "expectedKeyPoints": ["key point 1", "key point 2", "key point 3"],
  "timeLimit": 120
}

Only respond with valid JSON. No other text.`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 500
  });

  const text = response.choices[0]?.message?.content || '{}';
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      question: text,
      questionType: interviewType,
      difficulty,
      hints: [],
      expectedKeyPoints: [],
      timeLimit: 120
    };
  }
}

/**
 * Generate follow-up question based on user's answer
 */
async function generateFollowUp(params) {
  const { question, answer, role, interviewType } = params;

  const prompt = `You are a ${role} interviewer. The candidate answered the following question.

Question: ${question}
Candidate's Answer: ${answer}

Based on their answer, generate ONE relevant follow-up question to dig deeper or clarify.
Keep it concise and directly related to their response.

Respond with ONLY the follow-up question text. No JSON, no explanation.`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 150
  });

  return response.choices[0]?.message?.content?.trim() || '';
}

/**
 * Evaluate answer and provide detailed feedback
 */
async function evaluateAnswer(params) {
  const { question, answer, role, questionType, difficulty, expectedKeyPoints = [] } = params;

  if (!answer || answer.trim().length < 10) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ['No answer provided or answer too short'],
      suggestedAnswer: 'Please provide a detailed answer to receive meaningful feedback.',
      technicalDepth: 0,
      communicationScore: 0,
      starMethodScore: 0,
      keyPointsCovered: []
    };
  }

  const keyPointsText = expectedKeyPoints.length > 0
    ? `\nExpected key points: ${expectedKeyPoints.join(', ')}`
    : '';

  const prompt = `You are an expert ${role} interviewer evaluating a candidate's answer.

Question: ${question}
Question Type: ${questionType}
Difficulty: ${difficulty}${keyPointsText}

Candidate's Answer: ${answer}

Evaluate this answer comprehensively. Respond ONLY in this exact JSON format:
{
  "score": <0-10 integer>,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestedAnswer": "A comprehensive ideal answer for this question",
  "technicalDepth": <0-10 integer>,
  "communicationScore": <0-10 integer>,
  "starMethodScore": <0-10 integer, only relevant for behavioral>,
  "keyPointsCovered": ["covered point 1"],
  "missedKeyPoints": ["missed point 1"],
  "improvementTip": "One specific actionable tip"
}

Scoring guide:
- 9-10: Exceptional, FAANG-level answer
- 7-8: Strong answer with minor gaps
- 5-6: Adequate but missing important aspects
- 3-4: Partial understanding shown
- 0-2: Incorrect or insufficient

Only respond with valid JSON.`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 800
  });

  const text = response.choices[0]?.message?.content || '{}';
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      score: 5,
      strengths: ['Answer provided'],
      weaknesses: ['Could not parse detailed feedback'],
      suggestedAnswer: 'Please review standard interview resources for this topic.',
      technicalDepth: 5,
      communicationScore: 5,
      starMethodScore: 5,
      keyPointsCovered: [],
      missedKeyPoints: [],
      improvementTip: 'Practice explaining concepts clearly and concisely.'
    };
  }
}

/**
 * Generate final interview report
 */
async function generateReport(params) {
  const { role, answers, interviewType, experienceLevel } = params;

  const answersContext = answers.map((a, i) =>
    `Q${i + 1} (${a.questionType}, Score: ${a.feedback?.score || 0}/10): ${a.question}\nAnswer: ${a.answer?.substring(0, 200)}...`
  ).join('\n\n');

  const prompt = `You are an expert interviewer generating a final report for a ${experienceLevel} ${role} candidate.

Interview Type: ${interviewType}
Number of Questions: ${answers.length}

Interview Summary:
${answersContext}

Generate a comprehensive interview report. Respond ONLY in this exact JSON format:
{
  "overallAssessment": "2-3 sentence overall assessment",
  "hiringRecommendation": "Strong Yes / Yes / Maybe / No / Strong No",
  "improvementTips": ["specific tip 1", "specific tip 2", "specific tip 3", "specific tip 4"],
  "weakTopics": ["topic 1", "topic 2"],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "studyResources": ["resource suggestion 1", "resource suggestion 2"],
  "nextSteps": ["next step 1", "next step 2"]
}

Only respond with valid JSON.`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 600
  });

  const text = response.choices[0]?.message?.content || '{}';
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      overallAssessment: 'Interview completed. Review individual question feedback for details.',
      hiringRecommendation: 'Maybe',
      improvementTips: ['Practice more technical questions', 'Work on communication skills'],
      weakTopics: [],
      strengths: ['Completed the interview'],
      studyResources: [],
      nextSteps: ['Review feedback', 'Practice more']
    };
  }
}

module.exports = { generateQuestion, generateFollowUp, evaluateAnswer, generateReport };
