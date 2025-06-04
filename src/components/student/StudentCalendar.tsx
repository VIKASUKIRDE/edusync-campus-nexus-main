
import React from 'react';
import StudentCalendarView from './calendar/StudentCalendarView';

const StudentCalendar: React.FC = () => {
  return (
    <div className="space-y-6 animate-page-enter">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Calendar</h1>
          <p className="text-emerald-100">
            Manage your tasks, assignments, and important dates
          </p>
        </div>
      </div>

      <StudentCalendarView />
    </div>
  );
};

export default StudentCalendar;
