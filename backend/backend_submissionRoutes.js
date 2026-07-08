// ============================================================================
// Test Submission Routes
// ============================================================================

const express = require('express');
const { verifyToken } = require('./authRoutes');
const markingEngine = require('./utils/markingEngine');
const router = express.Router();

// POST /api/submissions - Start a new test
router.post('/', verifyToken, async (req, res) => {
  try {
    const { assessmentId } = req.body;
    const userId = req.userId;

    // In real app:
    // const submission = await TestSubmission.create({
    //   user_id: userId,
    //   assessment_id: assessmentId,
    //   status: 'in_progress'
    // });

    res.status(201).json({
      submissionId: 'submission-uuid-123',
      assessmentId,
      userId,
      startedAt: new Date(),
      status: 'in_progress'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/submissions/:id - Get submission details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // In real app: const submission = await TestSubmission.findByPk(id, { include: [StudentResponse] });

    const submission = {
      id,
      assessmentId: 'assessment-1',
      userId: req.userId,
      startedAt: new Date(Date.now() - 600000),
      submittedAt: null,
      totalScore: null,
      status: 'in_progress',
      timeSpentSeconds: 600,
      responses: [
        {
          id: 'response-1',
          questionId: 'q1',
          questionType: 'mcq',
          responseText: null,
          selectedOptionId: 'opt-c',
          isMarked: false,
          pointsAwarded: null
        },
        {
          id: 'response-2',
          questionId: 'q2',
          questionType: 'essay',
          responseText: 'A closure is a function that has access to its outer scope...',
          selectedOptionId: null,
          isMarked: false,
          pointsAwarded: null
        }
      ]
    };

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/submissions/:id/response - Submit a single response
router.post('/:submissionId/response', verifyToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { questionId, assessmentQuestionId, responseText, selectedOptionId } = req.body;

    // In real app:
    // const response = await StudentResponse.create({
    //   submission_id: submissionId,
    //   question_id: questionId,
    //   assessment_question_id: assessmentQuestionId,
    //   response_text: responseText,
    //   selected_option_id: selectedOptionId
    // });

    res.json({
      message: 'Response saved',
      responseId: 'response-uuid-456',
      questionId,
      savedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/submissions/:id/submit - Submit entire test for marking
router.post('/:id/submit', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // In real app:
    // const submission = await TestSubmission.findByPk(id, { include: [StudentResponse] });
    // const assessment = await Assessment.findByPk(submission.assessment_id);

    const submission = {
      id,
      assessment_id: 'assessment-1',
      responses: [
        {
          question_id: 'q1',
          assessment_question_id: 'aq1',
          selected_option_id: 'opt-c',
          response_text: null,
          points: 10
        },
        {
          question_id: 'q2',
          assessment_question_id: 'aq2',
          response_text: 'A closure is a function that has access to its outer scope...',
          points: null // Essay - needs manual marking
        }
      ]
    };

    const assessment = {
      id: 'assessment-1',
      total_points: 100,
      passing_score: 60
    };

    // Mark the submission
    const { totalScore, autoMarkedPoints, manualMarkingRequired, markingResults } =
      markingEngine.markSubmission(submission, assessment);

    // In real app:
    // await TestSubmission.update({
    //   submitted_at: new Date(),
    //   total_score: totalScore,
    //   status: manualMarkingRequired ? 'submitted' : 'marked'
    // }, { where: { id } });

    res.json({
      submissionId: id,
      status: manualMarkingRequired ? 'submitted' : 'marked',
      totalScore,
      autoMarkedPoints,
      manualMarkingRequired,
      markingResults,
      submittedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/submissions/:id/results - Get test results
router.get('/:id/results', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // In real app: const submission = await TestSubmission.findByPk(id);

    const results = {
      submissionId: id,
      assessmentName: 'JavaScript Basics Assessment',
      totalScore: 78,
      totalPoints: 100,
      passingScore: 60,
      percentage: 78,
      status: 'passed',
      submittedAt: new Date(),
      responses: [
        {
          questionId: 'q1',
          questionText: 'What is a closure?',
          questionType: 'mcq',
          userAnswer: 'Option C',
          correctAnswer: 'Option C',
          pointsAwarded: 10,
          maxPoints: 10,
          feedback: 'Correct!'
        },
        {
          questionId: 'q2',
          questionText: 'Explain the event loop',
          questionType: 'essay',
          userAnswer: 'The event loop is...',
          pointsAwarded: 8,
          maxPoints: 10,
          feedback: 'Good explanation. Could add more detail about microtasks.',
          markedBy: 'trainer@example.com',
          markedAt: new Date()
        }
      ]
    };

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
