
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell,
  Shield,
  Palette,
  Database,
  Lock,
  Mail,
  Activity
} from 'lucide-react';
import TeacherSettings from './TeacherSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-4 sm:space-y-8 p-3 sm:p-0">
      {/* Enhanced Header Section - Gray Theme for Settings */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-600 via-slate-600 to-zinc-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/5 rounded-full -translate-y-24 sm:-translate-y-48 translate-x-24 sm:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/5 rounded-full translate-y-16 sm:translate-y-32 -translate-x-16 sm:-translate-x-32"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl">
              <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Settings</h1>
              <p className="text-lg sm:text-xl text-white/90 mb-2 sm:mb-3">
                Manage your account, preferences, and system settings
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">Profile</span>
                  <span className="text-white/80 text-sm sm:text-base">Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">Security</span>
                  <span className="text-white/80 text-sm sm:text-base">& Privacy</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="w-full lg:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/20 text-white shadow-xl"
          >
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            System Status
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Profile Completion</CardTitle>
            <User className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">95%</div>
            <p className="text-xs text-gray-600 mt-1">Almost complete</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">8.5/10</div>
            <p className="text-xs text-slate-600 mt-1">Very secure</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-zinc-50 to-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">12</div>
            <p className="text-xs text-zinc-600 mt-1">Active alerts</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Last Backup</CardTitle>
            <Database className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2h ago</div>
            <p className="text-xs text-gray-600 mt-1">Auto-synced</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white rounded-lg">
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-white rounded-lg">
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white rounded-lg">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-white rounded-lg">
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <TeacherSettings />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <div className="space-y-6">
                <div className="text-center py-12">
                  <Lock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Settings</h3>
                  <p className="text-gray-600">Password, two-factor authentication, and more</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Preferences</h3>
                <p className="text-gray-600">Manage how you receive notifications</p>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <div className="text-center py-12">
                <Palette className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">App Preferences</h3>
                <p className="text-gray-600">Theme, language, and display settings</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
