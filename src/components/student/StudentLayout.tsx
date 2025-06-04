
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Calendar,
  BookOpen,
  ClipboardList,
  FileText,
  MessageSquare,
  Video,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [studentProfile, setStudentProfile] = useState({
    name: 'Student User',
    email: 'student@example.com',
    loginId: '',
    profilePicture: ''
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getCurrentStudentLoginId = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.login_id || 'STU001';
  };

  const loadStudentProfile = async () => {
    try {
      const studentLoginId = getCurrentStudentLoginId();
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('login_id', studentLoginId)
        .single();
      
      if (error) {
        console.error('Error loading student profile:', error);
        return;
      }

      if (data) {
        setStudentProfile({
          name: data.name || 'Student User',
          email: data.email || 'student@example.com',
          loginId: data.login_id || '',
          profilePicture: data.profile_picture_url || ''
        });
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        localStorage.setItem('currentUser', JSON.stringify({
          ...currentUser,
          name: data.name,
          email: data.email,
          profile_picture_url: data.profile_picture_url
        }));
      }
    } catch (error) {
      console.error('Error loading student profile:', error);
    }
  };

  useEffect(() => {
    loadStudentProfile();
    
    const channel = supabase
      .channel('student-profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'students'
        },
        (payload) => {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (payload.new.login_id === currentUser.login_id) {
            setStudentProfile({
              name: payload.new.name || 'Student User',
              email: payload.new.email || 'student@example.com',
              loginId: payload.new.login_id || '',
              profilePicture: payload.new.profile_picture_url || ''
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const menuItems = [
    { 
      path: '/student', 
      icon: Home, 
      label: 'Dashboard',
      gradient: 'from-blue-500 to-indigo-600'
    },
    { 
      path: '/student/calendar', 
      icon: Calendar, 
      label: 'Calendar',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      path: '/student/subjects', 
      icon: BookOpen, 
      label: 'My Subjects',
      gradient: 'from-purple-500 to-violet-600'
    },
    { 
      path: '/student/assignments', 
      icon: FileText, 
      label: 'Assignments & Quizzes',
      gradient: 'from-amber-500 to-orange-600'
    },
    { 
      path: '/student/live-classes', 
      icon: Video, 
      label: 'Live Classes',
      gradient: 'from-red-500 to-pink-600'
    },
    { 
      path: '/student/messages', 
      icon: MessageSquare, 
      label: 'Messages',
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      path: '/student/reports', 
      icon: BarChart3, 
      label: 'Reports & Marks',
      gradient: 'from-cyan-500 to-blue-600'
    },
    { 
      path: '/student/attendance', 
      icon: Users, 
      label: 'My Attendance',
      gradient: 'from-orange-500 to-red-600'
    },
    { 
      path: '/student/settings', 
      icon: Settings, 
      label: 'Settings',
      gradient: 'from-slate-500 to-gray-600'
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/student') {
      return location.pathname === '/student' || location.pathname === '/student/';
    }
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = sidebarCollapsed ? 'w-16 sm:w-20' : 'w-64 sm:w-72';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Enhanced Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-white/95 backdrop-blur-lg shadow-2xl border-r border-slate-200/50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 sm:h-20 px-3 sm:px-6 border-b border-slate-100">
          {!sidebarCollapsed && <Logo size="sm" showText={true} />}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <nav className="mt-4 sm:mt-8 px-2 sm:px-4 flex-1">
          <div className="space-y-1 sm:space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2 sm:px-3' : 'px-3 sm:px-4'} py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                    active
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={sidebarCollapsed ? 16 : 18} className={`${sidebarCollapsed ? '' : 'mr-2 sm:mr-3'} ${
                    active 
                      ? 'text-white' 
                      : 'text-slate-500 group-hover:text-slate-700'
                  }`} />
                  {!sidebarCollapsed && (
                    <span className="transition-all duration-200 truncate">{item.label}</span>
                  )}
                  {active && (
                    <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Profile Section */}
        {!sidebarCollapsed && (
          <div className="p-3 sm:p-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl sm:rounded-2xl p-2 sm:p-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-white shadow-md">
                <AvatarImage src={studentProfile.profilePicture} alt={studentProfile.name} />
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-xs sm:text-sm">
                  {studentProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{studentProfile.name}</p>
                <p className="text-xs text-slate-500 truncate">{studentProfile.loginId}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
              >
                <Menu size={18} />
              </button>
              <div className="lg:hidden">
                <Logo size="sm" showText={true} />
              </div>
              
              {/* Enhanced Search Bar */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64 lg:w-96 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-300 transition-all duration-200 text-sm"
                />
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Profile & Logout */}
              <div className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 pr-2 sm:pr-4">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-white shadow-md">
                  <AvatarImage src={studentProfile.profilePicture} alt={studentProfile.name} />
                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-xs sm:text-sm">
                    {studentProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">{studentProfile.name}</p>
                  <p className="text-xs text-slate-500">{studentProfile.loginId}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 border-slate-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 text-xs sm:text-sm"
              >
                <LogOut size={14} />
                <span className="hidden sm:block">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default StudentLayout;
