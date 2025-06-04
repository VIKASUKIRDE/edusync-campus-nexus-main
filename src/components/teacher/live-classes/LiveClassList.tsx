
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users,
  ExternalLink,
  PlayCircle,
  StopCircle,
  Settings,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { LiveClass, StudentEnrollment } from '@/hooks/useLiveClasses';
import StudentEnrollmentModal from './StudentEnrollmentModal';
import EditLiveClass from './EditLiveClass';

interface LiveClassListProps {
  classes: LiveClass[];
  type: 'upcoming' | 'live' | 'completed';
  onStartClass?: (classId: string) => void;
  onEndClass?: (classId: string) => void;
  onUpdate?: (id: string, updates: any) => Promise<{ error: any }>;
  onDelete?: (id: string) => Promise<{ error: any }>;
  onGetEnrolledStudents?: (semester: string, section: string) => Promise<{ data: StudentEnrollment[], error: any }>;
}

const LiveClassList: React.FC<LiveClassListProps> = ({ 
  classes, 
  type, 
  onStartClass, 
  onEndClass,
  onUpdate,
  onDelete,
  onGetEnrolledStudents
}) => {
  const [enrollmentModal, setEnrollmentModal] = useState<{
    open: boolean;
    semester: string;
    section: string;
    students: StudentEnrollment[];
    meetingLink: string;
    classTitle: string;
  }>({
    open: false,
    semester: '',
    section: '',
    students: [],
    meetingLink: '',
    classTitle: ''
  });

  const [editModal, setEditModal] = useState<{
    open: boolean;
    liveClass: LiveClass | null;
  }>({
    open: false,
    liveClass: null
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleJoinClass = (liveClass: LiveClass) => {
    if (liveClass.meeting_link) {
      window.open(liveClass.meeting_link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShowEnrollment = async (liveClass: LiveClass) => {
    if (!onGetEnrolledStudents) return;
    
    const { data: students, error } = await onGetEnrolledStudents(liveClass.semester, liveClass.section);
    
    if (!error) {
      setEnrollmentModal({
        open: true,
        semester: liveClass.semester,
        section: liveClass.section,
        students: students || [],
        meetingLink: liveClass.meeting_link,
        classTitle: liveClass.title
      });
    }
  };

  const handleEditClass = (liveClass: LiveClass) => {
    setEditModal({
      open: true,
      liveClass
    });
  };

  const handleDeleteClass = async (liveClass: LiveClass) => {
    if (!onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this class?')) {
      await onDelete(liveClass.id);
    }
  };

  const handleEditSuccess = () => {
    setEditModal({ open: false, liveClass: null });
  };

  if (classes.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Video className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {type} classes
          </h3>
          <p className="text-gray-600">
            {type === 'upcoming' && "No upcoming classes scheduled"}
            {type === 'live' && "No classes are currently live"}
            {type === 'completed' && "No completed classes yet"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {classes.map((liveClass) => (
          <Card key={liveClass.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {liveClass.title}
                    </CardTitle>
                    <Badge className={getStatusColor(liveClass.status)}>
                      {type === 'live' && (
                        <div className="flex items-center space-x-1">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Live Now</span>
                        </div>
                      )}
                      {type === 'upcoming' && 'Scheduled'}
                      {type === 'completed' && 'Completed'}
                    </Badge>
                  </div>
                  
                  {liveClass.description && (
                    <p className="text-gray-600 mb-3">{liveClass.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(liveClass.class_date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{liveClass.start_time} - {liveClass.end_time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Video className="h-4 w-4" />
                      <span>{getPlatformIcon(liveClass.platform)} {getPlatformName(liveClass.platform)}</span>
                    </div>
                    <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-600" onClick={() => handleShowEnrollment(liveClass)}>
                      <Users className="h-4 w-4" />
                      <span>View Students</span>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleJoinClass(liveClass)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Meeting Link
                    </DropdownMenuItem>
                    {type === 'upcoming' && onStartClass && (
                      <DropdownMenuItem onClick={() => onStartClass(liveClass.id)}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Class
                      </DropdownMenuItem>
                    )}
                    {type === 'live' && onEndClass && (
                      <DropdownMenuItem onClick={() => onEndClass(liveClass.id)}>
                        <StopCircle className="h-4 w-4 mr-2" />
                        End Class
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleShowEnrollment(liveClass)}>
                      <Users className="h-4 w-4 mr-2" />
                      View Students
                    </DropdownMenuItem>
                    {type !== 'completed' && (
                      <DropdownMenuItem onClick={() => handleEditClass(liveClass)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Class
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClass(liveClass)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Class
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-4 text-sm">
                    <span><strong>Subject:</strong> {liveClass.subject_name || 'N/A'}</span>
                    <span><strong>Class:</strong> {liveClass.semester} - {liveClass.section}</span>
                  </div>
                  
                  {liveClass.meeting_id && (
                    <div className="text-sm text-gray-600">
                      <strong>Meeting ID:</strong> {liveClass.meeting_id}
                      {liveClass.meeting_password && (
                        <span className="ml-4"><strong>Password:</strong> {liveClass.meeting_password}</span>
                      )}
                    </div>
                  )}
                  
                  {liveClass.notes && (
                    <div className="text-sm text-gray-600">
                      <strong>Notes:</strong> {liveClass.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {type === 'live' && onEndClass && (
                    <Button 
                      onClick={() => onEndClass(liveClass.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      End Class
                    </Button>
                  )}
                  
                  {type === 'upcoming' && onStartClass && (
                    <Button 
                      onClick={() => onStartClass(liveClass.id)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Class
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => handleJoinClass(liveClass)}
                    size="sm"
                    className={
                      type === 'live' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {type === 'live' ? 'Join Now' : 'Open Link'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student Enrollment Modal */}
      <StudentEnrollmentModal
        open={enrollmentModal.open}
        onClose={() => setEnrollmentModal(prev => ({ ...prev, open: false }))}
        semester={enrollmentModal.semester}
        section={enrollmentModal.section}
        students={enrollmentModal.students}
        meetingLink={enrollmentModal.meetingLink}
        classTitle={enrollmentModal.classTitle}
      />

      {/* Edit Class Modal */}
      <EditLiveClass
        open={editModal.open}
        onClose={() => setEditModal({ open: false, liveClass: null })}
        onSuccess={handleEditSuccess}
        liveClass={editModal.liveClass}
        onUpdate={onUpdate || (async () => ({ error: null }))}
      />
    </>
  );
};

export default LiveClassList;
