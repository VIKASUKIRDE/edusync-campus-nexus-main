
import React from 'react';
import StudentMarks from './reports/StudentMarks';

const StudentReports: React.FC = () => {
  return (
    <div className="space-y-6 animate-page-enter">
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Reports & Marks</h1>
          <p className="text-cyan-100">
            View your academic performance, marks, and attendance reports
          </p>
        </div>
      </div>

      <StudentMarks />
    </div>
  );
};

export default StudentReports;
