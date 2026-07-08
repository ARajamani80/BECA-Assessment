// ============================================================================
// Assessment Taker Component
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export default function AssessmentTaker() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const fetchAssessment = async () => {
    try {
      // Fetch assessment details
      const res = await axios.get(`${API_BASE}/assessments/${assessmentId}`);
      setAssessment(res.data);

      // Create submission
      const subRes = await axios.post(`${API_BASE}/submissions`, {
        assessmentId
      });
      setSubmission(subRes.data);

      // Set timer
      if (res.data.timeLimitMinutes) {
        setTimeRemaining(res.data.timeLimitMinutes * 60);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < assessment.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmit = async () => {
    if (!submission) return;

    try {
      const res = await axios.post(
        `${API_BASE}/submissions/${submission.submissionId}/submit`,
        { responses }
      );

      navigate(`/results/${submission.submissionId}`);
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!assessment || !submission) return <div>Error loading assessment</div>;

  const currentQuestion = assessment.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / assessment.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assessment.name}</h1>
              <p className="text-gray-600">Question {currentQuestionIdx + 1} of {assessment.questions.length}</p>
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 text-lg font-semibold text-red-600">
                <Clock className="w-5 h-5" />
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.questionText}</h2>

          {/* MCQ */}
          {currentQuestion.questionType === 'mcq' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.key}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.key}
                    checked={responses[currentQuestion.id] === option.key}
                    onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-medium">{option.key}. {option.text}</span>
                </label>
              ))}
            </div>
          )}

          {/* Essay */}
          {currentQuestion.questionType === 'essay' && (
            <textarea
              value={responses[currentQuestion.id] || ''}
              onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              rows="8"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIdx === 0}
            className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex gap-2">
            {assessment.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  idx === currentQuestionIdx
                    ? 'bg-blue-600 text-white'
                    : responses[assessment.questions[idx].id]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleNext}
              disabled={currentQuestionIdx === assessment.questions.length - 1}
              className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleSubmit}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
