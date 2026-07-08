// ============================================================================
// Navbar Component
// ============================================================================

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, BarChart3, Settings } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">KS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">KnowledgeSmart</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Dashboard
            </Link>

            <Link
              to="/analytics"
              className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </Link>

            {(user?.role === 'admin' || user?.role === 'trainer') && (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
              >
                <Settings className="w-4 h-4" /> Admin
              </Link>
            )}

            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-gray-600 text-xs capitalize">{user?.role}</p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
