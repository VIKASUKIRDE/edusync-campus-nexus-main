import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Plus,
  Video,
  FileText,
  Bell,
  Award,
  Target,
  Activity,
  Star,
  ChevronRight,
  CalendarDays,
  ClipboardList,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalStudents: number;
  totalSubjects: number;
  upcomingClasses: number;
  pendingAssignments: number;
}

interface RecentActivity {
  id: string;
  type: 'assignment' | 'class' | 'message';
  title: string;
  time: string;
  status?: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  type: 'class' | 'assignment' | 'meeting';
  time: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

const TeacherDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalSubjects: 0,
    upcomingClasses: 0,
    pendingAssignments: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getCurrentTeacherId = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('employee_id', currentUser.employee_id || 'TCH001')
      .single();
    return teacher?.id;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) return;

      // Load subjects count
      const { count: subjectsCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId);

      // Load assignments count
      const { count: assignmentsCount } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)
        .eq('status', 'published');

      // Load upcoming classes
      const today = new Date().toISOString().split('T')[0];
      const { count: classesCount } = await supabase
        .from('live_classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)
        .gte('class_date', today);

      // Load upcoming events from calendar
      const { data: calendarEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('teacher_id', teacherId)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5);

      // Transform calendar events to upcoming events
      const events: UpcomingEvent[] = calendarEvents?.map(event => ({
        id: event.id,
        title: event.title,
        type: event.event_type as 'class' | 'assignment' | 'meeting',
        time: new Date(event.start_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        date: new Date(event.start_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        priority: event.priority as 'high' | 'medium' | 'low' || 'medium'
      })) || [];

      // Load recent activities
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title, created_at, status')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: classes } = await supabase
        .from('live_classes')
        .select('id, title, created_at, status')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
        .limit(3);

      const activities: RecentActivity[] = [
        ...(assignments?.map(a => ({
          id: a.id,
          type: 'assignment' as const,
          title: a.title,
          time: new Date(a.created_at).toLocaleDateString(),
          status: a.status
        })) || []),
        ...(classes?.map(c => ({
          id: c.id,
          type: 'class' as const,
          title: c.title,
          time: new Date(c.created_at).toLocaleDateString(),
          status: c.status
        })) || [])
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setStats({
        totalStudents: 0, // This would need enrollment data
        totalSubjects: subjectsCount || 0,
        upcomingClasses: classesCount || 0,
        pendingAssignments: assignmentsCount || 0
      });

      setRecentActivities(activities);
      setUpcomingEvents(events);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const quickActions = [
    {
      title: 'Create Assignment',
      description: 'New assignment or quiz',
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      action: () => navigate('/teacher/assignments')
    },
    {
      title: 'Schedule Class',
      description: 'Live class session',
      icon: Video,
      color: 'from-green-500 to-emerald-500',
      action: () => navigate('/teacher/live-classes')
    },
    {
      title: 'View Calendar',
      description: 'Check schedule',
      icon: Calendar,
      color: 'from-blue-500 to-indigo-500',
      action: () => navigate('/teacher/calendar')
    },
    {
      title: 'Manage Students',
      description: 'Student records',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/teacher/students')
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
        <div className="animate-pulse">
          <div className="h-40 sm:h-48 bg-gray-200 rounded-xl mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0 max-w-7xl mx-auto animate-fade-in">
      {/* Modern Hero Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-slide-in-top">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 sm:w-60 sm:h-60 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-xs sm:text-sm lg:text-base">{currentDate}</p>
                  <p className="text-white/60 text-xs sm:text-sm">{currentTime}</p>
                </div>
              </div>
              
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                  Welcome back, {currentUser.name || 'Teacher'}! 👋
                </h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-xl max-w-2xl leading-relaxed">
                  Ready to inspire minds today? Your classroom awaits with new opportunities to make a difference.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                <div className="flex items-center space-x-1 sm:space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300" />
                  <span className="text-xs sm:text-sm font-medium">Excellence Educator</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300" />
                  <span className="text-xs sm:text-sm font-medium">5.0 Rating</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={() => navigate('/teacher/assignments')}
                className="w-full sm:w-auto bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Create Assignment</span>
                <span className="sm:hidden">Create</span>
              </Button>
              <Button 
                onClick={() => navigate('/teacher/live-classes')}
                className="w-full sm:w-auto bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <Video className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Start Class</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 animate-fade-in-up">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-700 mb-1">Active Subjects</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats.totalSubjects}</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  This semester
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-700 mb-1">Assignments</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-900">{stats.pendingAssignments}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  Published
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-700 mb-1">Live Classes</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900">{stats.upcomingClasses}</p>
                <p className="text-xs text-purple-600 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Scheduled
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Video className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-orange-700 mb-1">Messages</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-900">0</p>
                <p className="text-xs text-orange-600 mt-1 flex items-center">
                  <Bell className="h-3 w-3 mr-1" />
                  Unread
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="shadow-xl border-0 overflow-hidden animate-fade-in-up">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg lg:text-xl flex items-center">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 sm:p-4 lg:p-6 flex flex-col items-center space-y-2 sm:space-y-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md"
                onClick={action.action}
              >
                <div className={`p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${action.color} shadow-lg`}>
                  <action.icon className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-xs sm:text-sm lg:text-base text-gray-900">{action.title}</div>
                  <div className="text-xs text-gray-500 mt-1 hidden sm:block">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Activity and Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-in-up">
        {/* Upcoming Events */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg lg:text-xl flex items-center justify-between">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 text-indigo-600" />
                <span className="hidden sm:inline">Upcoming Events</span>
                <span className="sm:hidden">Events</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/calendar')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50 hover:from-indigo-50 hover:to-purple-50 transition-all duration-300">
                    <div className={`p-1 sm:p-2 rounded-md sm:rounded-lg ${
                      event.type === 'class' ? 'bg-blue-500' :
                      event.type === 'assignment' ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {event.type === 'class' && <Video className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                      {event.type === 'assignment' && <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                      {event.type === 'meeting' && <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.date} at {event.time}</p>
                    </div>
                    <div className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                      event.priority === 'high' ? 'bg-red-100 text-red-800' :
                      event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.priority}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">No upcoming events</p>
                <Button 
                  variant="outline" 
                  className="mt-3 sm:mt-4 text-xs sm:text-sm"
                  size="sm"
                  onClick={() => navigate('/teacher/calendar')}
                >
                  View Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg lg:text-xl flex items-center">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 text-green-600" />
              <span className="hidden sm:inline">Recent Activity</span>
              <span className="sm:hidden">Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            {recentActivities.length > 0 ? (
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50 to-green-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                    <div className="p-1 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                      {activity.type === 'assignment' && <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                      {activity.type === 'class' && <Video className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                      {activity.type === 'message' && <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    {activity.status && (
                      <span className={`text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${
                        activity.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : activity.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Clock className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule Enhanced */}
      <Card className="shadow-xl border-0 overflow-hidden animate-fade-in-up">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-base sm:text-lg lg:text-xl flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 text-purple-600" />
              <span className="hidden sm:inline">Today's Schedule</span>
              <span className="sm:hidden">Schedule</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/calendar')}>
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="text-center py-6 sm:py-8 lg:py-12">
            <div className="relative">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mx-auto text-gray-300 mb-3 sm:mb-4" />
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-6 sm:w-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-2 w-2 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">All caught up! 🎉</h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4">No classes scheduled for today. Time to plan ahead!</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Button 
                onClick={() => navigate('/teacher/live-classes')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Schedule a Class</span>
                <span className="sm:hidden">Schedule</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/teacher/calendar')}
                className="text-xs sm:text-sm"
                size="sm"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Calendar</span>
                <span className="sm:hidden">Calendar</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboardHome;
