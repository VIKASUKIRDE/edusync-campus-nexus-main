
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Calendar, 
  Clock, 
  ExternalLink,
  PlayCircle,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LiveClass {
  id: string;
  title: string;
  description?: string;
  class_date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  platform: string;
  status: string;
  semester: string;
  section: string;
  meeting_id?: string;
  meeting_password?: string;
  subjects?: {
    name: string;
    code: string;
  } | null;
  teachers?: {
    name: string;
  } | null;
}

const StudentLiveClasses: React.FC = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  
  const { toast } = useToast();

  const getCurrentStudent = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log('Current user from localStorage:', currentUser);
      
      if (!currentUser.login_id) {
        console.error('No login_id found in localStorage');
        return null;
      }

      const { data: student, error } = await supabase
        .from('students')
        .select('id, login_id, name, semester, section, email, mobile')
        .eq('login_id', currentUser.login_id)
        .single();

      if (error) {
        console.error('Error fetching student:', error);
        toast({
          title: "Error",
          description: "Failed to load student information",
          variant: "destructive",
        });
        return null;
      }

      console.log('Fetched student data:', student);
      setCurrentStudent(student);
      return student;
    } catch (error) {
      console.error('Error in getCurrentStudent:', error);
      return null;
    }
  };

  // Helper function to check if student's semester/section matches class criteria
  const isStudentEligibleForClass = (liveClass: LiveClass, student: any) => {
    if (!student) return false;
    
    console.log('Checking eligibility for class:', {
      classId: liveClass.id,
      classTitle: liveClass.title,
      classSemester: liveClass.semester,
      classSection: liveClass.section,
      studentSemester: student.semester,
      studentSection: student.section
    });

    // Handle semester matching - support both "2nd" and "2" formats
    const studentSemesterNormalized = student.semester.toLowerCase().replace(/[^0-9]/g, '');
    const classSemesters = liveClass.semester.split(',').map(s => s.trim().toLowerCase().replace(/[^0-9]/g, ''));
    const semesterMatch = classSemesters.includes(studentSemesterNormalized);

    // Handle section matching
    const studentSectionNormalized = student.section.toUpperCase().trim();
    const classSections = liveClass.section.split(',').map(s => s.trim().toUpperCase());
    const sectionMatch = classSections.includes(studentSectionNormalized);

    console.log('Eligibility check result:', {
      studentSemesterNormalized,
      classSemesters,
      semesterMatch,
      studentSectionNormalized,
      classSections,
      sectionMatch,
      eligible: semesterMatch && sectionMatch
    });

    return semesterMatch && sectionMatch;
  };

  const loadLiveClasses = async () => {
    try {
      setLoading(true);
      
      const student = currentStudent || await getCurrentStudent();
      if (!student) {
        console.log('No student found, cannot load live classes');
        setLoading(false);
        return;
      }

      console.log('Loading live classes for student:', {
        semester: student.semester,
        section: student.section
      });

      // Get all live classes and filter on the frontend for better matching
      const { data: classes, error } = await supabase
        .from('live_classes')
        .select(`
          *,
          subjects (name, code),
          teachers (name)
        `)
        .order('class_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error loading live classes:', error);
        toast({
          title: "Error",
          description: "Failed to load live classes: " + error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Raw live classes data:', classes);

      // Transform and filter classes based on student eligibility
      const transformedClasses: LiveClass[] = (classes || [])
        .map(liveClass => ({
          id: liveClass.id,
          title: liveClass.title,
          description: liveClass.description,
          class_date: liveClass.class_date,
          start_time: liveClass.start_time,
          end_time: liveClass.end_time,
          meeting_link: liveClass.meeting_link,
          platform: liveClass.platform,
          status: liveClass.status,
          semester: liveClass.semester,
          section: liveClass.section,
          meeting_id: liveClass.meeting_id,
          meeting_password: liveClass.meeting_password,
          subjects: liveClass.subjects && typeof liveClass.subjects === 'object' && 'name' in liveClass.subjects ? {
            name: liveClass.subjects.name,
            code: liveClass.subjects.code
          } : null,
          teachers: liveClass.teachers && typeof liveClass.teachers === 'object' && 'name' in liveClass.teachers ? {
            name: liveClass.teachers.name
          } : null
        }))
        .filter(liveClass => isStudentEligibleForClass(liveClass, student));

      console.log('Filtered live classes for student:', transformedClasses);
      setLiveClasses(transformedClasses);
    } catch (error) {
      console.error('Error loading live classes:', error);
      toast({
        title: "Error",
        description: "Failed to load live classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentStudent();
  }, []);

  useEffect(() => {
    if (currentStudent) {
      console.log('Current student changed, loading live classes');
      loadLiveClasses();
    }
  }, [currentStudent]);

  // Set up real-time subscription for live classes
  useEffect(() => {
    if (!currentStudent) return;
    
    console.log('Setting up real-time subscription for live classes');
    
    const channel = supabase
      .channel('live-classes-student-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_classes'
        },
        (payload) => {
          console.log('Live class real-time update:', payload);
          loadLiveClasses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentStudent]);

  const getClassStatus = (liveClass: LiveClass) => {
    const now = new Date();
    const startTime = new Date(`${liveClass.class_date}T${liveClass.start_time}`);
    const endTime = new Date(`${liveClass.class_date}T${liveClass.end_time}`);

    if (liveClass.status === 'live') {
      return { status: 'live', color: 'green', text: 'Live Now' };
    } else if (liveClass.status === 'completed') {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else if (now < startTime && liveClass.status === 'scheduled') {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now >= startTime && now <= endTime && liveClass.status === 'scheduled') {
      return { status: 'available', color: 'green', text: 'Available Now' };
    } else if (liveClass.status === 'cancelled') {
      return { status: 'cancelled', color: 'red', text: 'Cancelled' };
    } else {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    }
  };

  const handleJoinClass = (liveClass: LiveClass) => {
    if (liveClass.meeting_link) {
      window.open(liveClass.meeting_link, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "No meeting link",
        description: "Meeting link not available for this class",
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'zoom':
        return '🔵';
      case 'google_meet':
        return '🟢';
      case 'microsoft_teams':
        return '🟣';
      default:
        return '📹';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'google_meet':
        return 'Google Meet';
      case 'microsoft_teams':
        return 'Microsoft Teams';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  // Filter classes by status
  const upcomingClasses = liveClasses.filter(cls => {
    const status = getClassStatus(cls);
    return status.status === 'upcoming' || status.status === 'live' || status.status === 'available';
  });

  const pastClasses = liveClasses.filter(cls => {
    const status = getClassStatus(cls);
    return status.status === 'ended' || status.status === 'cancelled';
  });

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

  if (!currentStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Video className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-gray-500">Unable to load student information</p>
          <p className="text-sm mt-2">Please check your login credentials</p>
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
                Join scheduled live classes and access recordings
              </p>
              <p className="text-blue-200 text-sm mt-1">
                Semester {currentStudent.semester} - Section {currentStudent.section}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{liveClasses.length}</div>
            <div className="text-blue-100 text-sm">Total Classes</div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <strong>Debug Info:</strong> Student: {currentStudent.name} | 
            Semester: {currentStudent.semester} | Section: {currentStudent.section} | 
            Total Classes Found: {liveClasses.length}
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Total Classes</p>
                <p className="text-2xl font-bold text-blue-900">{liveClasses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-700">Upcoming/Live</p>
                <p className="text-2xl font-bold text-yellow-900">{upcomingClasses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{pastClasses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming & Live Classes */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Upcoming & Live Classes</h2>
        {upcomingClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingClasses.map((liveClass) => {
              const statusInfo = getClassStatus(liveClass);
              return (
                <Card key={liveClass.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                          {liveClass.title}
                        </CardTitle>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(liveClass.class_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {liveClass.start_time} - {liveClass.end_time}
                          </div>
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-2" />
                            {getPlatformIcon(liveClass.platform)} {getPlatformName(liveClass.platform)}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          statusInfo.status === 'live' || statusInfo.status === 'available'
                            ? 'border-green-200 text-green-700 bg-green-50'
                            : statusInfo.status === 'upcoming'
                            ? 'border-blue-200 text-blue-700 bg-blue-50'
                            : 'border-gray-200 text-gray-700 bg-gray-50'
                        }
                      >
                        {(statusInfo.status === 'live' || statusInfo.status === 'available') && (
                          <div className="flex items-center space-x-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>{statusInfo.text}</span>
                          </div>
                        )}
                        {statusInfo.status === 'upcoming' && statusInfo.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {liveClass.description && (
                      <p className="text-slate-600 text-sm mb-4">{liveClass.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span>Subject: {liveClass.subjects?.name || 'N/A'}</span>
                      <span>By: {liveClass.teachers?.name || 'N/A'}</span>
                    </div>

                    {liveClass.meeting_id && (
                      <div className="bg-gray-50 p-2 rounded text-xs mb-4">
                        <strong>Meeting ID:</strong> {liveClass.meeting_id}
                        {liveClass.meeting_password && (
                          <div><strong>Password:</strong> {liveClass.meeting_password}</div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mb-4">
                      <Badge variant="outline">Semester {liveClass.semester}</Badge>
                      <Badge variant="outline">Section {liveClass.section}</Badge>
                      <Badge 
                        variant="outline" 
                        className={
                          liveClass.status === 'live' 
                            ? 'border-green-200 text-green-700 bg-green-50'
                            : liveClass.status === 'completed'
                            ? 'border-gray-200 text-gray-700 bg-gray-50'
                            : 'border-blue-200 text-blue-700 bg-blue-50'
                        }
                      >
                        {liveClass.status}
                      </Badge>
                    </div>

                    <Button 
                      onClick={() => handleJoinClass(liveClass)}
                      disabled={statusInfo.status === 'ended' || statusInfo.status === 'cancelled'}
                      className={`w-full ${
                        statusInfo.status === 'live' || statusInfo.status === 'available'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                      }`}
                    >
                      {statusInfo.status === 'live' || statusInfo.status === 'available' ? (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Join Now
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Join Class
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <Video className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No upcoming classes scheduled</p>
              <p className="text-slate-400 text-sm mt-2">
                Classes for Semester {currentStudent.semester}, Section {currentStudent.section} will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Classes */}
      {pastClasses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Past Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastClasses.map((liveClass) => {
              const statusInfo = getClassStatus(liveClass);
              return (
                <Card key={liveClass.id} className="border-0 shadow-lg opacity-75">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                      {liveClass.title}
                    </CardTitle>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(liveClass.class_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {liveClass.start_time} - {liveClass.end_time}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {liveClass.description && (
                      <p className="text-slate-600 text-sm mb-4">{liveClass.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span>Subject: {liveClass.subjects?.name || 'N/A'}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          statusInfo.status === 'cancelled'
                            ? 'border-red-200 text-red-700 bg-red-50'
                            : 'border-gray-200 text-gray-700 bg-gray-50'
                        }
                      >
                        {statusInfo.text}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLiveClasses;
