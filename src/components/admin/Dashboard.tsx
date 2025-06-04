
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, Building2, Calendar, TrendingUp, UserPlus, Book } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { useTeachers } from '@/hooks/useTeachers';
import { useCourses } from '@/hooks/useCourses';
import { useDepartments } from '@/hooks/useDepartments';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { students, loading: studentsLoading } = useStudents();
  const { teachers, loading: teachersLoading } = useTeachers();
  const { courses, loading: coursesLoading } = useCourses();
  const { departments, loading: departmentsLoading } = useDepartments();
  const navigate = useNavigate();

  const loading = studentsLoading || teachersLoading || coursesLoading || departmentsLoading;

  // Calculate department statistics
  const departmentStats = departments.map(dept => {
    const deptStudents = students.filter(s => s.department_id === dept.id).length;
    const deptTeachers = teachers.filter(t => t.department_id === dept.id).length;
    const deptCourses = courses.filter(c => c.department_id === dept.id).length;
    
    return {
      ...dept,
      totalStudents: deptStudents,
      totalTeachers: deptTeachers,
      totalCourses: deptCourses
    };
  });

  // Recent activity (based on created_at timestamps)
  const recentActivity = [
    ...students.slice(-3).map(s => ({
      type: 'student',
      name: s.name,
      action: 'registered',
      time: new Date(s.created_at || '').toLocaleDateString(),
      icon: UserPlus
    })),
    ...teachers.slice(-2).map(t => ({
      type: 'teacher',
      name: t.name,
      action: 'joined',
      time: new Date(t.created_at || '').toLocaleDateString(),
      icon: GraduationCap
    })),
    ...courses.slice(-2).map(c => ({
      type: 'course',
      name: c.name,
      action: 'added',
      time: new Date(c.created_at || '').toLocaleDateString(),
      icon: Book
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  const quickLinks = [
    { title: 'Add Student', description: 'Register new student', path: '/admin/students', icon: UserPlus, color: 'bg-blue-500' },
    { title: 'Add Teacher', description: 'Add faculty member', path: '/admin/teachers', icon: GraduationCap, color: 'bg-green-500' },
    { title: 'Add Course', description: 'Create new course', path: '/admin/courses', icon: BookOpen, color: 'bg-purple-500' },
    { title: 'Bulk Upload', description: 'Import data from CSV', path: '/admin/bulk-upload', icon: TrendingUp, color: 'bg-orange-500' }
  ];

  if (loading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the College Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              Faculty members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              Available courses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Academic departments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate(link.path)}
              >
                <div className={`p-2 rounded-full ${link.color}`}>
                  <link.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium">{link.title}</div>
                  <div className="text-xs text-muted-foreground">{link.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                    <div className="p-2 rounded-full bg-blue-100">
                      <activity.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.name}</p>
                      <p className="text-xs text-gray-600">{activity.action} on {activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Department Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept) => (
                <div key={dept.id} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm mb-2">{dept.name}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{dept.totalStudents}</div>
                      <div className="text-gray-500">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{dept.totalTeachers}</div>
                      <div className="text-gray-500">Teachers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{dept.totalCourses}</div>
                      <div className="text-gray-500">Courses</div>
                    </div>
                  </div>
                </div>
              ))}
              {departmentStats.length === 0 && (
                <p className="text-sm text-gray-500">No departments found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
