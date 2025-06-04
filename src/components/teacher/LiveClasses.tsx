
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Plus, 
  Users, 
  Calendar,
  Clock,
  Play,
  Settings,
  BarChart3,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLiveClasses } from '@/hooks/useLiveClasses';
import CreateLiveClass from './live-classes/CreateLiveClass';
import LiveClassList from './live-classes/LiveClassList';

interface LiveClassStats {
  totalClasses: number;
  upcomingClasses: number;
  liveNowClasses: number;
  completedClasses: number;
}

const LiveClasses: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [stats, setStats] = useState<LiveClassStats>({
    totalClasses: 0,
    upcomingClasses: 0,
    liveNowClasses: 0,
    completedClasses: 0
  });

  const { 
    liveClasses, 
    loading, 
    updateClassStatus,
    updateLiveClass,
    deleteLiveClass,
    getEnrolledStudents,
    refetch
  } = useLiveClasses();

  const { toast } = useToast();

  const calculateStats = (classes: any[]) => {
    const now = new Date();
    
    const upcoming = classes.filter(cls => {
      const classDateTime = new Date(`${cls.class_date} ${cls.start_time}`);
      return classDateTime > now && cls.status === 'scheduled';
    });

    const liveNow = classes.filter(cls => cls.status === 'live');
    const completed = classes.filter(cls => cls.status === 'completed');

    setStats({
      totalClasses: classes.length,
      upcomingClasses: upcoming.length,
      liveNowClasses: liveNow.length,
      completedClasses: completed.length
    });
  };

  useEffect(() => {
    calculateStats(liveClasses);
  }, [liveClasses]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    refetch();
    toast({
      title: "Success",
      description: "Live class created successfully",
    });
  };

  const handleStartClass = async (classId: string) => {
    const { error } = await updateClassStatus(classId, 'live');
    if (!error) {
      toast({
        title: "Success",
        description: "Class started successfully",
      });
    }
  };

  const handleEndClass = async (classId: string) => {
    const { error } = await updateClassStatus(classId, 'completed');
    if (!error) {
      toast({
        title: "Success",
        description: "Class completed successfully",
      });
    }
  };

  // Filter classes by status and time
  const now = new Date();
  const upcomingClasses = liveClasses.filter(cls => {
    const classDateTime = new Date(`${cls.class_date} ${cls.start_time}`);
    return (classDateTime > now && cls.status === 'scheduled') || cls.status === 'scheduled';
  });

  const liveNowClasses = liveClasses.filter(cls => cls.status === 'live');
  const completedClasses = liveClasses.filter(cls => cls.status === 'completed');

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading live classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header - Blue Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Live Classes</h1>
              <p className="text-blue-100">
                Schedule and manage your live classes with automated reminders
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Class
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Classes</CardTitle>
            <Video className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalClasses}</div>
            <p className="text-xs text-blue-600 mt-1">All classes</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.upcomingClasses}</div>
            <p className="text-xs text-yellow-600 mt-1">Scheduled</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Live Now</CardTitle>
            <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.liveNowClasses}</div>
            <p className="text-xs text-green-600 mt-1">Active now</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.completedClasses}</div>
            <p className="text-xs text-gray-600 mt-1">Finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Classes Tabs */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-50 p-1 rounded-lg">
              <TabsTrigger 
                value="upcoming" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Calendar className="h-4 w-4" />
                <span>Upcoming ({upcomingClasses.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="live" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Now ({liveNowClasses.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Clock className="h-4 w-4" />
                <span>Completed ({completedClasses.length})</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="upcoming">
                <LiveClassList 
                  classes={upcomingClasses}
                  type="upcoming"
                  onStartClass={handleStartClass}
                  onUpdate={updateLiveClass}
                  onDelete={deleteLiveClass}
                  onGetEnrolledStudents={getEnrolledStudents}
                />
              </TabsContent>

              <TabsContent value="live">
                <LiveClassList 
                  classes={liveNowClasses}
                  type="live"
                  onEndClass={handleEndClass}
                  onUpdate={updateLiveClass}
                  onDelete={deleteLiveClass}
                  onGetEnrolledStudents={getEnrolledStudents}
                />
              </TabsContent>

              <TabsContent value="completed">
                <LiveClassList 
                  classes={completedClasses}
                  type="completed"
                  onUpdate={updateLiveClass}
                  onDelete={deleteLiveClass}
                  onGetEnrolledStudents={getEnrolledStudents}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Live Class Modal */}
      <CreateLiveClass
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default LiveClasses;
