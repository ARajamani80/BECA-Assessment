// ============================================================================
// Marking Engine - Handles automatic and manual marking
// ============================================================================

/**
 * Mark a test submission
 * @param {Object} submission - Test submission with responses
 * @param {Object} assessment - Assessment details with marking criteria
 * @returns {Object} Marking results
 */
function markSubmission(submission, assessment) {
  const markingResults = [];
  let autoMarkedPoints = 0;
  let manualMarkingRequired = false;
  let totalScore = 0;

  // Process each response
  submission.responses.forEach((response) => {
    const markingCriteria = assessment.markingCriteria[response.assessment_question_id];
    let pointsAwarded = 0;
    let marked = false;
    let feedback = '';

    if (!markingCriteria) {
      console.warn(`No marking criteria for question ${response.assessment_question_id}`);
      return;
    }

    // MCQ Auto-marking
    if (markingCriteria.marking_type === 'exact_match') {
      const result = markMCQ(response, markingCriteria);
      pointsAwarded = result.points;
      marked = result.isCorrect;
      feedback = result.feedback;
      autoMarkedPoints += pointsAwarded;
    }

    // Essay/Practical - Manual marking required
    if (markingCriteria.marking_type === 'rubric' || markingCriteria.marking_type === 'manual') {
      manualMarkingRequired = true;
      feedback = `Awaiting manual marking by trainer`;
    }

    // Partial match (fill-in-the-blank, keyword matching)
    if (markingCriteria.marking_type === 'partial_match') {
      const result = markPartialMatch(response, markingCriteria);
      pointsAwarded = result.points;
      marked = result.isMarked;
      feedback = result.feedback;
      autoMarkedPoints += pointsAwarded;
    }

    totalScore += pointsAwarded;

    markingResults.push({
      questionId: response.question_id,
      assessmentQuestionId: response.assessment_question_id,
      pointsAwarded,
      maxPoints: markingCriteria.max_points,
      isMarked: marked,
      feedback,
      markingType: markingCriteria.marking_type,
      requiresManualReview: manualMarkingRequired && markingCriteria.marking_type !== 'exact_match'
    });
  });

  // Calculate final status
  const passingScore = assessment.passing_score || 60;
  const percentage = (totalScore / assessment.total_points) * 100;
  const status = percentage >= passingScore ? 'passed' : 'failed';

  return {
    totalScore,
    totalPoints: assessment.total_points,
    autoMarkedPoints,
    manualMarkingRequired,
    percentage: Math.round(percentage),
    status,
    markingResults
  };
}

/**
 * Mark Multiple Choice Question
 * @param {Object} response - Student response
 * @param {Object} criteria - Marking criteria
 * @returns {Object} Marking result
 */
function markMCQ(response, criteria) {
  const expectedAnswer = criteria.expected_answer; // e.g., "opt-c"
  const isCorrect = response.selected_option_id === expectedAnswer;

  return {
    isCorrect,
    points: isCorrect ? criteria.max_points : 0,
    feedback: isCorrect ? 'Correct answer!' : `Incorrect. Expected: ${expectedAnswer}`
  };
}

/**
 * Mark with partial matching (keywords, fill-in-the-blank)
 * @param {Object} response - Student response
 * @param {Object} criteria - Marking criteria
 * @returns {Object} Marking result
 */
function markPartialMatch(response, criteria) {
  const userAnswer = (response.response_text || '').toLowerCase().trim();
  const expectedAnswers = criteria.expected_answer.split('||').map(a => a.toLowerCase().trim());

  // Exact match
  if (expectedAnswers.includes(userAnswer)) {
    return {
      isMarked: true,
      points: criteria.max_points,
      feedback: 'Correct!'
    };
  }

  // Keyword matching (at least 50% match)
  const userWords = userAnswer.split(/\s+/);
  const expectedWords = expectedAnswers[0].split(/\s+/);

  const matchCount = userWords.filter(word =>
    expectedWords.some(exp => exp.includes(word) || word.includes(exp))
  ).length;

  const matchPercentage = matchCount / expectedWords.length;

  if (matchPercentage >= 0.5) {
    const pointsAwarded = Math.round((matchPercentage * criteria.max_points * 0.8));
    return {
      isMarked: true,
      points: pointsAwarded,
      feedback: `Partial credit: ${matchPercentage.toFixed(0)}% match`
    };
  }

  return {
    isMarked: true,
    points: 0,
    feedback: 'No match with expected answer'
  };
}

/**
 * Manual marking for essay/practical questions
 * @param {Object} response - Student response
 * @param {Array} rubricCriteria - Rubric items with points
 * @param {number} totalPoints - Total points for the question
 * @returns {Object} Manual marking result
 */
function markEssayManually(response, rubricCriteria, totalPoints) {
  // Example rubric items: [
  //   { criteria: 'Clarity', maxPoints: 5 },
  //   { criteria: 'Accuracy', maxPoints: 10 },
  //   { criteria: 'Completeness', maxPoints: 5 }
  // ]

  return {
    questionId: response.question_id,
    userAnswer: response.response_text,
    rubricCriteria: rubricCriteria.map(item => ({
      ...item,
      pointsAwarded: null // Trainer fills this in
    })),
    totalPointsAwarded: null, // Auto-calculated when all criteria filled
    feedback: '', // Trainer's feedback
    requiresReview: true
  };
}

/**
 * Calculate proficiency level based on score
 * @param {number} percentage - Score percentage
 * @returns {string} Proficiency level
 */
function calculateProficiencyLevel(percentage) {
  if (percentage >= 80) return 'advanced';
  if (percentage >= 60) return 'intermediate';
  if (percentage >= 40) return 'beginner';
  return 'needs_improvement';
}

/**
 * Bulk mark multiple submissions (for batch processing)
 * @param {Array} submissions - Array of submissions
 * @param {Object} assessment - Assessment details
 * @returns {Array} Marked submissions
 */
function bulkMarkSubmissions(submissions, assessment) {
  return submissions.map(submission => {
    const result = markSubmission(submission, assessment);
    return {
      submissionId: submission.id,
      userId: submission.user_id,
      ...result
    };
  });
}

module.exports = {
  markSubmission,
  markMCQ,
  markPartialMatch,
  markEssayManually,
  calculateProficiencyLevel,
  bulkMarkSubmissions
};
