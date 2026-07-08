// ============================================================================
// Results Component
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Home } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export default function Results() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [submissionId]);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API_BASE}/submissions/${submissionId}/results`);
      setResults(res.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!results) return <div>Error loading results</div>;

  const isPassed = results.status === 'passed';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Score Card */}
        <div className={`rounded-lg shadow p-8 mb-8 text-center ${
          isPassed ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <CheckCircle className="w-16 h-16 text-green-600" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>

          <h1 className={`text-4xl font-bold mb-2 ${
            isPassed ? 'text-green-700' : 'text-red-700'
          }`}>
            {isPassed ? 'Congratulations!' : 'Try Again'}
          </h1>

          <p className="text-gray-600 mb-6">Assessment: {results.assessmentName}</p>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            <div className="bg-white rounded p-4">
              <p className="text-gray-600 text-sm">Your Score</p>
              <p className="text-2xl font-bold text-gray-900">{results.totalScore}</p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="text-gray-600 text-sm">Percentage</p>
              <p className="text-2xl font-bold text-blue-600">{results.percentage}%</p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="text-gray-600 text-sm">Passing Score</p>
              <p className="text-2xl font-bold text-gray-900">{results.passingScore}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Home className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        {/* Detailed Responses */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Results</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {results.responses.map((response, idx) => (
              <div key={idx} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{response.questionText}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Your answer:</strong> {response.userAnswer}
                    </p>
                    {response.correctAnswer && (
                      <p className="text-sm text-gray-600">
                        <strong>Correct answer:</strong> {response.correctAnswer}
                      </p>
                    )}
                    {response.feedback && (
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Feedback:</strong> {response.feedback}
                      </p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <p className={`text-lg font-bold ${
                      response.pointsAwarded === response.maxPoints
                        ? 'text-green-600'
                        : response.pointsAwarded > 0
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {response.pointsAwarded} / {response.maxPoints}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
