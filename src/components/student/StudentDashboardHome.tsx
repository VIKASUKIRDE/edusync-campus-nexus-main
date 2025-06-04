
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Video, 
  MessageSquare, 
  BarChart3, 
  Calendar,
  ClipboardList,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentData } from '@/hooks/useStudentData';
import { supabase } from '@/integrations/supabase/client';

const StudentDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { currentStudent, loading } = useStudentData();
  const [stats, setStats] = useState({
    subjects: 3,
    pendingAssignments: 0,
    completedSubmissions: 0,
    upcomingClasses: 0,
    unreadMessages: 2,
    attendancePercentage: 75
  });

  useEffect(() => {
    if (currentStudent) {
      loadStudentStats();
    }
  }, [currentStudent]);

  const loadStudentStats = async () => {
    if (!currentStudent) return;

    try {
      // Normalize student semester and section for matching
      const studentSemester = currentStudent.semester.replace(/[^0-9]/g, '');
      const studentSection = currentStudent.section.replace(/[^A-Z]/g, '').toUpperCase();

      // Get pending assignments count
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('id')
        .eq('semester', studentSemester)
        .eq('section', studentSection)
        .eq('status', 'published');

      // Get completed submissions count
      const { data: submissionsData } = await supabase
        .from('student_submissions')
        .select('id')
        .eq('student_id', currentStudent.id);

      const pendingAssignments = (assignmentsData?.length || 0) - (submissionsData?.length || 0);

      setStats(prev => ({
        ...prev,
        pendingAssignments: Math.max(0, pendingAssignments),
        completedSubmissions: submissionsData?.length || 0
      }));
    } catch (error) {
      console.error('Error loading student stats:', error);
    }
  };

  // Get student's first name for personalized greeting
  const getFirstName = (fullName: string) => {
    if (!fullName) return 'Student';
    return fullName.split(' ')[0];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome back, {currentStudent ? getFirstName(currentStudent.name) : 'Student'}! 🎓
              </h1>
              <p className="text-blue-100">
                Continue your learning journey and track your progress
              </p>
              {currentStudent && (
                <p className="text-blue-200 text-sm mt-1">
                  {currentStudent.name} • {currentStudent.login_id} • Semester {currentStudent.semester} - Section {currentStudent.section}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => navigate('/student/assignments')}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              View Assignments
            </Button>
            <Button
              onClick={() => navigate('/student/live-classes')}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              <Video className="h-4 w-4 mr-2" />
              Join Classes
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.subjects}</div>
            <p className="text-xs text-blue-600 mt-1">Enrolled</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.pendingAssignments}</div>
            <p className="text-xs text-orange-600 mt-1">Assignments</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.completedSubmissions}</div>
            <p className="text-xs text-green-600 mt-1">Submissions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Classes</CardTitle>
            <Video className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.upcomingClasses}</div>
            <p className="text-xs text-purple-600 mt-1">Upcoming</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">{stats.unreadMessages}</div>
            <p className="text-xs text-teal-600 mt-1">Unread</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{stats.attendancePercentage}%</div>
            <p className="text-xs text-indigo-600 mt-1">Present</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/student/assignments')}
              className="h-20 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white flex flex-col items-center justify-center space-y-2"
            >
              <ClipboardList className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">View Assignments</div>
                <div className="text-xs opacity-90">Check pending assignments</div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/student/live-classes')}
              className="h-20 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white flex flex-col items-center justify-center space-y-2"
            >
              <Video className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Join Live Class</div>
                <div className="text-xs opacity-90">Attend scheduled classes</div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/student/subjects')}
              variant="outline"
              className="h-20 border-2 hover:bg-blue-50 flex flex-col items-center justify-center space-y-2"
            >
              <BookOpen className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <div className="font-medium text-slate-700">My Subjects</div>
                <div className="text-xs text-slate-500">View enrolled subjects</div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/student/calendar')}
              variant="outline"
              className="h-20 border-2 hover:bg-green-50 flex flex-col items-center justify-center space-y-2"
            >
              <Calendar className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="font-medium text-slate-700">Calendar</div>
                <div className="text-xs text-slate-500">View schedule</div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/student/reports')}
              variant="outline"
              className="h-20 border-2 hover:bg-purple-50 flex flex-col items-center justify-center space-y-2"
            >
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <div className="text-center">
                <div className="font-medium text-slate-700">Reports & Marks</div>
                <div className="text-xs text-slate-500">View performance</div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/student/messages')}
              variant="outline"
              className="h-20 border-2 hover:bg-teal-50 flex flex-col items-center justify-center space-y-2"
            >
              <MessageSquare className="h-6 w-6 text-teal-600" />
              <div className="text-center">
                <div className="font-medium text-slate-700">Messages</div>
                <div className="text-xs text-slate-500">Check notifications</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No upcoming classes</p>
              <p className="text-slate-400 text-sm mt-1">
                Your scheduled classes will appear here
              </p>
              <Button
                onClick={() => navigate('/student/live-classes')}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                View All Classes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Enrolled in new subjects</p>
                <p className="text-xs text-slate-500">Welcome to your new semester!</p>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200">New</Badge>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Profile updated successfully</p>
                <p className="text-xs text-slate-500">Your student information is up to date</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">Complete</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboardHome;
