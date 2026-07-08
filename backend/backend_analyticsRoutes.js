// ============================================================================
// Analytics Routes
// ============================================================================

const express = require('express');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// GET /api/analytics/dashboard - Main dashboard data
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const dashboardData = {
      totalTests: 245,
      totalTrainees: 42,
      avgScore: 72.5,
      passRate: 68,
      topSkills: [
        { skillName: 'JavaScript', proficiency: 85, traineesAssessed: 35 },
        { skillName: 'Python', proficiency: 78, traineesAssessed: 28 },
        { skillName: 'Project Management', proficiency: 72, traineesAssessed: 42 }
      ],
      skillGaps: [
        { skillName: 'Advanced Python', gap: 25, priority: 'high' },
        { skillName: 'Cloud Architecture', gap: 35, priority: 'critical' },
        { skillName: 'Kubernetes', gap: 40, priority: 'critical' }
      ],
      recentTests: [
        { testName: 'JS Basics', completedBy: 12, avgScore: 75, date: new Date() },
        { testName: 'Python Advanced', completedBy: 8, avgScore: 68, date: new Date() }
      ]
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/user/:userId - Individual user performance
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const userAnalytics = {
      userId,
      userName: 'John Doe',
      department: 'Engineering',
      totalAssessments: 8,
      totalScore: 582,
      averageScore: 72.75,
      skillProficiency: [
        { skillName: 'JavaScript', score: 85, level: 'advanced', lastAssessed: new Date() },
        { skillName: 'Python', score: 68, level: 'intermediate', lastAssessed: new Date() },
        { skillName: 'SQL', score: 72, level: 'intermediate', lastAssessed: new Date() }
      ],
      assessmentHistory: [
        {
          assessmentName: 'JS Basics',
          score: 85,
          percentage: 85,
          status: 'passed',
          date: new Date(),
          timeTaken: '25 mins'
        },
        {
          assessmentName: 'Python Advanced',
          score: 68,
          percentage: 68,
          status: 'passed',
          date: new Date(),
          timeTaken: '45 mins'
        }
      ]
    };

    res.json(userAnalytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/department/:departmentId - Department level analytics
router.get('/department/:departmentId', verifyToken, async (req, res) => {
  try {
    const { departmentId } = req.params;

    const departmentAnalytics = {
      departmentId,
      departmentName: 'Engineering',
      totalTrainees: 42,
      averageProficiency: 72,
      skillBreakdown: [
        {
          skillName: 'JavaScript',
          avgScore: 78,
          proficiencyLevel: 'intermediate',
          traineesAbovePassing: 38,
          traineesAboveTargetScore: 25
        },
        {
          skillName: 'Python',
          avgScore: 65,
          proficiencyLevel: 'beginner',
          traineesAbovePassing: 28,
          traineesAboveTargetScore: 12
        }
      ],
      skillGaps: [
        { skillName: 'Advanced Python', currentLevel: 45, targetLevel: 75, gap: 30 },
        { skillName: 'Cloud Architecture', currentLevel: 40, targetLevel: 75, gap: 35 }
      ],
      performanceDistribution: {
        excellent: 8, // 80-100
        good: 18,     // 60-79
        average: 12,  // 40-59
        needsImprovement: 4 // <40
      }
    };

    res.json(departmentAnalytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/skill/:skillId - Skill-level analytics
router.get('/skill/:skillId', verifyToken, async (req, res) => {
  try {
    const { skillId } = req.params;

    const skillAnalytics = {
      skillId,
      skillName: 'JavaScript',
      totalAssessments: 35,
      averageScore: 78,
      passRate: 88,
      proficiencyDistribution: {
        advanced: 12,
        intermediate: 18,
        beginner: 5
      },
      departmentPerformance: [
        { departmentName: 'Engineering', avgScore: 82, traineesAssessed: 28 },
        { departmentName: 'Quality Assurance', avgScore: 72, traineesAssessed: 7 }
      ]
    };

    res.json(skillAnalytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/audit-report - Generate audit report
router.get('/audit-report', verifyToken, async (req, res) => {
  try {
    const { departmentId, skillId, fromDate, toDate } = req.query;

    const auditReport = {
      reportId: 'report-001',
      generatedAt: new Date(),
      generatedBy: 'admin@example.com',
      period: { from: fromDate, to: toDate },
      organizationOverview: {
        totalTrainees: 150,
        totalSkillsAssessed: 12,
        totalAssessments: 450
      },
      skillComplianceStatus: [
        {
          skillName: 'JavaScript',
          complianceTarget: 75,
          currentPercentage: 68,
          gap: -7,
          status: 'below_target'
        },
        {
          skillName: 'Python',
          complianceTarget: 70,
          currentPercentage: 82,
          gap: 12,
          status: 'above_target'
        }
      ],
      recommendations: [
        {
          priority: 'high',
          skillName: 'JavaScript',
          recommendation: 'Increase training and practice opportunities',
          estimatedCost: 'Medium'
        },
        {
          priority: 'critical',
          skillName: 'Cloud Architecture',
          recommendation: 'Hire specialized trainer or external training',
          estimatedCost: 'High'
        }
      ]
    };

    res.json(auditReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
