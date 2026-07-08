// ============================================================================
// Assessment Routes
// ============================================================================

const express = require('express');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// GET /api/assessments - List all assessments
router.get('/', verifyToken, async (req, res) => {
  try {
    const { skillId, status } = req.query;

    // In real app: query database
    const assessments = [
      {
        id: 'assessment-1',
        name: 'JavaScript Basics Assessment',
        description: 'Test your knowledge of JavaScript fundamentals',
        skillId: 'skill-1',
        totalPoints: 100,
        passingScore: 60,
        timeLimitMinutes: 30,
        shuffleQuestions: true,
        totalQuestions: 10,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'assessment-2',
        name: 'Advanced Python Assessment',
        description: 'Advanced Python concepts and best practices',
        skillId: 'skill-2',
        totalPoints: 150,
        passingScore: 75,
        timeLimitMinutes: 60,
        shuffleQuestions: true,
        totalQuestions: 15,
        isActive: true,
        createdAt: new Date()
      }
    ];

    res.json({ data: assessments, total: assessments.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assessments/:id - Get assessment details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // In real app: await Assessment.findByPk(id, { include: [AssessmentQuestion, Question] })
    const assessment = {
      id: id,
      name: 'JavaScript Basics Assessment',
      description: 'Test your knowledge of JavaScript fundamentals',
      skillId: 'skill-1',
      totalPoints: 100,
      passingScore: 60,
      timeLimitMinutes: 30,
      shuffleQuestions: true,
      showResultsImmediately: true,
      questions: [
        {
          id: 'q1',
          sequence: 1,
          questionText: 'What is a closure in JavaScript?',
          questionType: 'essay',
          pointsAllocated: 10,
          difficulty: 'medium'
        },
        {
          id: 'q2',
          sequence: 2,
          questionText: 'Which of the following is NOT a primitive type?',
          questionType: 'mcq',
          pointsAllocated: 10,
          difficulty: 'easy',
          options: [
            { key: 'A', text: 'String' },
            { key: 'B', text: 'Number' },
            { key: 'C', text: 'Object', isCorrect: true },
            { key: 'D', text: 'Boolean' }
          ]
        }
      ]
    };

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/assessments - Create new assessment (Trainer only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'trainer' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, description, skillId, totalPoints, passingScore, timeLimitMinutes, shuffleQuestions, shuffleOptions } = req.body;

    // In real app:
    // const assessment = await Assessment.create({
    //   name, description, skill_id: skillId, total_points: totalPoints,
    //   passing_score: passingScore, time_limit_minutes: timeLimitMinutes,
    //   shuffle_questions: shuffleQuestions, shuffle_options: shuffleOptions,
    //   created_by: req.userId
    // });

    res.status(201).json({
      id: 'new-assessment-id',
      name,
      skillId,
      createdAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/assessments/:id - Update assessment
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'trainer' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;

    // In real app: await Assessment.update(updates, { where: { id } });

    res.json({ message: 'Assessment updated', id, updates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/assessments/:id - Delete assessment
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete assessments' });
    }

    const { id } = req.params;
    // In real app: await Assessment.destroy({ where: { id } });

    res.json({ message: 'Assessment deleted', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
