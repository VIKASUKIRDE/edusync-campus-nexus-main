
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/components/admin/Dashboard';
import ManageStudents from '@/components/admin/ManageStudents';
import ManageTeachers from '@/components/admin/ManageTeachers';
import ManageCourses from '@/components/admin/ManageCourses';
import ManageDepartments from '@/components/admin/ManageDepartments';
import BulkUpload from '@/components/admin/BulkUpload';
import Reports from '@/components/admin/Reports';
import Settings from '@/components/admin/Settings';

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<ManageStudents />} />
        <Route path="/teachers" element={<ManageTeachers />} />
        <Route path="/courses" element={<ManageCourses />} />
        <Route path="/departments" element={<ManageDepartments />} />
        <Route path="/bulk-upload" element={<BulkUpload />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;
