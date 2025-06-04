
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentLayout from '@/components/student/StudentLayout';
import StudentDashboardHome from '@/components/student/StudentDashboardHome';
import StudentSettings from '@/components/student/StudentSettings';
import StudentSubjects from '@/components/student/StudentSubjects';
import StudentAssignments from '@/components/student/StudentAssignments';
import StudentMessages from '@/components/student/StudentMessages';
import StudentLiveClasses from '@/components/student/StudentLiveClasses';
import StudentCalendar from '@/components/student/StudentCalendar';
import StudentReports from '@/components/student/StudentReports';
import StudentAttendance from '@/components/student/attendance/StudentAttendance';

const StudentDashboard: React.FC = () => {
  return (
    <StudentLayout>
      <div className="page-transition">
        <Routes>
          <Route path="/" element={<div className="animate-page-enter"><StudentDashboardHome /></div>} />
          <Route path="/calendar" element={<div className="animate-page-enter"><StudentCalendar /></div>} />
          <Route path="/subjects" element={<div className="animate-page-enter"><StudentSubjects /></div>} />
          <Route path="/assignments" element={<div className="animate-page-enter"><StudentAssignments /></div>} />
          <Route path="/live-classes" element={<div className="animate-page-enter"><StudentLiveClasses /></div>} />
          <Route path="/messages" element={<div className="animate-page-enter"><StudentMessages /></div>} />
          <Route path="/reports" element={<div className="animate-page-enter"><StudentReports /></div>} />
          <Route path="/attendance" element={<div className="animate-page-enter"><StudentAttendance /></div>} />
          <Route path="/settings" element={<div className="animate-page-enter"><StudentSettings /></div>} />
        </Routes>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
