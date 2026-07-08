// ============================================================================
// Dashboard Component
// ============================================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Clock, Trophy, Users } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export default function Dashboard({ user }) {
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch assessments
      const assessmentsRes = await axios.get(`${API_BASE}/assessments`);
      setAssessments(assessmentsRes.data.data);

      // Fetch dashboard stats
      const statsRes = await axios.get(`${API_BASE}/analytics/dashboard`);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
          <p className="text-gray-600 mt-2">Track your skill assessments and progress</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<BookOpen className="w-6 h-6" />}
              label="Total Tests"
              value={stats.totalTests}
            />
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label="Average Score"
              value={`${Math.round(stats.avgScore)}%`}
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Pass Rate"
              value={`${stats.passRate}%`}
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="Total Trainees"
              value={stats.totalTrainees}
            />
          </div>
        )}

        {/* Available Assessments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Available Assessments</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {assessments.length > 0 ? (
              assessments.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No assessments available
              </div>
            )}
          </div>
        </div>

        {/* Skill Gaps Section */}
        {stats && stats.skillGaps && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skill Gaps to Address</h2>
            <div className="space-y-3">
              {stats.skillGaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900">{gap.skillName}</p>
                    <p className="text-sm text-gray-600">Priority: {gap.priority}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{gap.gap}%</p>
                    <p className="text-xs text-gray-500">Gap</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-blue-500">{icon}</div>
      </div>
    </div>
  );
}

function AssessmentCard({ assessment }) {
  return (
    <div className="p-6 hover:bg-gray-50 transition">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{assessment.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{assessment.description}</p>
          <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
            <span>{assessment.totalQuestions} questions</span>
            <span>{assessment.timeLimitMinutes} mins</span>
            <span>Max: {assessment.totalPoints} points</span>
          </div>
        </div>
        <a
          href={`/assessment/${assessment.id}`}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Start Test
        </a>
      </div>
    </div>
  );
}
