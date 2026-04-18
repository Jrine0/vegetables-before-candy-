import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎓 future me
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Platform is running successfully!
        </p>
        <div className="space-y-4">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            ✅ Backend API: Running on port 3001
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
            ✅ Frontend: Running on port 3000
          </div>
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
            ✅ Database: SQLite with demo data
          </div>
        </div>
        <div className="mt-8">
          <a 
            href="/dashboard" 
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}