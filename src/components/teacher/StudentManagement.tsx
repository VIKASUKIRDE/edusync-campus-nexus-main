
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, FileSpreadsheet, TrendingUp } from 'lucide-react';
import StudentList from './student-management/StudentList';
import AttendanceManagement from './student-management/AttendanceManagement';
import MarksManagement from './student-management/MarksManagement';
import StudentReports from './student-management/StudentReports';

const StudentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="bg-white/10 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Student Management</h1>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
              Manage students, attendance, marks, and performance reports
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl min-w-[320px] sm:min-w-0">
                <TabsTrigger 
                  value="students" 
                  className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 sm:py-3 text-xs sm:text-sm"
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Student List</span>
                  <span className="sm:hidden">Students</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="attendance" 
                  className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 sm:py-3 text-xs sm:text-sm"
                >
                  <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Attendance</span>
                  <span className="sm:hidden">Attend</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="marks" 
                  className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 sm:py-3 text-xs sm:text-sm"
                >
                  <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Marks</span>
                  <span className="sm:hidden">Marks</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 sm:py-3 text-xs sm:text-sm"
                >
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Reports</span>
                  <span className="sm:hidden">Reports</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-4 sm:mt-6">
              <TabsContent value="students">
                <StudentList />
              </TabsContent>
              <TabsContent value="attendance">
                <AttendanceManagement />
              </TabsContent>
              <TabsContent value="marks">
                <MarksManagement />
              </TabsContent>
              <TabsContent value="reports">
                <StudentReports />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
