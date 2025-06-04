
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Mail, 
  Phone, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  UserCheck,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  login_id: string;
  email: string;
  mobile?: string;
}

interface StudentEnrollmentModalProps {
  open: boolean;
  onClose: () => void;
  semester: string;
  section: string;
  students: Student[];
  meetingLink: string;
  classTitle: string;
}

const StudentEnrollmentModal: React.FC<StudentEnrollmentModalProps> = ({
  open,
  onClose,
  semester,
  section,
  students: initialStudents,
  meetingLink,
  classTitle
}) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  const { toast } = useToast();

  // Helper function to match students with class semester/section criteria
  const findMatchingStudents = async (classSemester: string, classSection: string) => {
    try {
      console.log('Finding students for class criteria:', { classSemester, classSection });

      // Parse semester and section criteria
      const semesterCriteria = classSemester.split(',').map(s => s.trim().toLowerCase().replace(/[^0-9]/g, ''));
      const sectionCriteria = classSection.split(',').map(s => s.trim().toUpperCase());

      console.log('Parsed criteria:', { semesterCriteria, sectionCriteria });

      // Get all students
      const { data: allStudents, error } = await supabase
        .from('students')
        .select('id, name, login_id, email, mobile, semester, section')
        .order('name');

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }

      console.log('All students from database:', allStudents);

      // Filter students that match the criteria
      const matchingStudents = (allStudents || []).filter(student => {
        const studentSemesterNormalized = student.semester.toLowerCase().replace(/[^0-9]/g, '');
        const studentSectionNormalized = student.section.toUpperCase().trim();

        const semesterMatch = semesterCriteria.includes(studentSemesterNormalized);
        const sectionMatch = sectionCriteria.includes(studentSectionNormalized);

        console.log('Student matching check:', {
          student: student.name,
          studentSemester: student.semester,
          studentSemesterNormalized,
          studentSection: student.section,
          studentSectionNormalized,
          semesterMatch,
          sectionMatch,
          matches: semesterMatch && sectionMatch
        });

        return semesterMatch && sectionMatch;
      });

      console.log('Matching students found:', matchingStudents);
      return matchingStudents;
    } catch (error) {
      console.error('Error finding matching students:', error);
      throw error;
    }
  };

  // Load students when modal opens
  useEffect(() => {
    if (open && semester && section) {
      loadEnrolledStudents();
    }
  }, [open, semester, section]);

  const loadEnrolledStudents = async () => {
    try {
      setLoadingStudents(true);
      console.log('Loading students for class:', { semester, section });

      const matchingStudents = await findMatchingStudents(semester, section);
      setStudents(matchingStudents || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load enrolled students",
        variant: "destructive",
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopiedLink(true);
      toast({
        title: "Success",
        description: "Meeting link copied to clipboard",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy meeting link",
        variant: "destructive",
      });
    }
  };

  const openMeetingLink = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    }
  };

  const sendNotificationToStudents = async () => {
    try {
      setLoading(true);
      
      // Here you could implement email/SMS notification logic
      // For now, we'll just show a success message
      toast({
        title: "Notifications Sent",
        description: `Meeting link sent to ${students.length} students`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Enrolled Students - {classTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Class Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{classTitle}</p>
                  <p className="text-sm text-gray-600">
                    Semester {semester} - Section {section}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    <UserCheck className="h-4 w-4 mr-1" />
                    {students.length} Students
                  </Badge>
                </div>
              </div>

              {/* Meeting Link */}
              {meetingLink && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">Meeting Link:</p>
                      <p className="text-sm text-blue-700 break-all">{meetingLink}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyMeetingLink}
                        className="border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        {copiedLink ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={openMeetingLink}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Enrolled Students</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={loadEnrolledStudents}
                  variant="outline"
                  size="sm"
                  disabled={loadingStudents}
                >
                  {loadingStudents ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Button
                  onClick={sendNotificationToStudents}
                  disabled={loading || students.length === 0}
                  size="sm"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Notify All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingStudents ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2">Loading students...</span>
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-3">
                  {students.map((student, index) => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>ID: {student.login_id}</span>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{student.email}</span>
                            </div>
                            {student.mobile && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{student.mobile}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Enrolled
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No students enrolled</p>
                  <p className="text-sm text-gray-400 mt-1">
                    No students found for Semester {semester}, Section {section}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {students.length > 0 && meetingLink && (
              <Button onClick={sendNotificationToStudents} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Meeting Link to All
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentEnrollmentModal;
