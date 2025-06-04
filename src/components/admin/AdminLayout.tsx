
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  Upload, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User',
    email: 'imashish1332@gmail.com',
    profilePicture: ''
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load admin profile data
  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error loading admin profile:', error);
        return;
      }

      if (data) {
        setAdminProfile({
          name: data.name || 'Admin User',
          email: data.email || 'imashish1332@gmail.com',
          profilePicture: data.profile_picture_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  };

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/teachers', icon: GraduationCap, label: 'Teachers' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { path: '/admin/departments', icon: Building2, label: 'Departments' },
    { path: '/admin/bulk-upload', icon: Upload, label: 'Bulk Upload' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Modern Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-md shadow-2xl border-r border-slate-200/50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100">
          <Logo size="sm" showText={true} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-8 px-4 flex-1">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={20} className={`mr-3 ${
                    isActive(item.path) 
                      ? 'text-white' 
                      : 'text-slate-500 group-hover:text-slate-700'
                  }`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Modern Top Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
          <div className="flex items-center justify-between h-20 px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
              >
                <Menu size={20} />
              </button>
              <div className="lg:hidden">
                <Logo size="sm" showText={true} />
              </div>
              
              {/* Search Bar */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-80 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            {/* Right Section - Profile & Logout */}
            <div className="flex items-center space-x-4">
              {/* Profile Section */}
              <div className="flex items-center space-x-3 bg-slate-50 rounded-2xl p-2 pr-4">
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                  <AvatarImage src={adminProfile.profilePicture} alt={adminProfile.name} />
                  <AvatarFallback className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold">
                    {adminProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-slate-900">{adminProfile.name}</p>
                  <p className="text-xs text-slate-500">{adminProfile.email}</p>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <LogOut size={16} />
                <span className="hidden sm:block">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content with improved spacing */}
        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
