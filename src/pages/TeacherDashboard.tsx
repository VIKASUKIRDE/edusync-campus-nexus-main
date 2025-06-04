
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TeacherLayout from '@/components/teacher/TeacherLayout';
import TeacherDashboardHome from '@/components/teacher/TeacherDashboardHome';
import TeacherSettings from '@/components/teacher/TeacherSettings';
import TeacherSubjects from '@/components/teacher/TeacherSubjects';
import StudentManagement from '@/components/teacher/StudentManagement';
import AssignmentsQuizzes from '@/components/teacher/AssignmentsQuizzes';
import Messages from '@/components/teacher/Messages';
import LiveClasses from '@/components/teacher/LiveClasses';
import TeacherCalendar from '@/components/teacher/TeacherCalendar';

const TeacherDashboard: React.FC = () => {
  return (
    <TeacherLayout>
      <div className="page-transition">
        <Routes>
          <Route path="/" element={<div className="animate-page-enter"><TeacherDashboardHome /></div>} />
          <Route path="/calendar" element={<div className="animate-page-enter"><TeacherCalendar /></div>} />
          <Route path="/subjects" element={<div className="animate-page-enter"><TeacherSubjects /></div>} />
          <Route path="/students" element={<div className="animate-page-enter"><StudentManagement /></div>} />
          <Route path="/assignments" element={<div className="animate-page-enter"><AssignmentsQuizzes /></div>} />
          <Route path="/live-classes" element={<div className="animate-page-enter"><LiveClasses /></div>} />
          <Route path="/messages" element={<div className="animate-page-enter"><Messages /></div>} />
          <Route path="/settings" element={<div className="animate-page-enter"><TeacherSettings /></div>} />
        </Routes>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
