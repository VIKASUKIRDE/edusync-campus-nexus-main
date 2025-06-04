import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, FileText, Clock, CheckCircle, AlertCircle, Search, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  total_marks: number;
  deadline: string;
  semester: string;
  section: string;
}

interface StudentSubmission {
  id: string;
  student_id: string;
  student_name: string;
  student_login_id: string;
  submitted_at: string;
  total_score: number | null;
  grading_status: string;
  attempt_number: number;
  is_late: boolean;
}

interface EligibleStudent {
  student_id: string;
  student_name: string;
  student_login_id: string;
  has_submitted: boolean;
}

interface ViewSubmissionsProps {
  assignment: Assignment;
  open: boolean;
  onClose: () => void;
}

const ViewSubmissions: React.FC<ViewSubmissionsProps> = ({ assignment, open, onClose }) => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [eligibleStudents, setEligibleStudents] = useState<EligibleStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllStudents, setShowAllStudents] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && assignment?.id) {
      loadSubmissionsAndStudents();
    }
  }, [open, assignment?.id]);

  const loadSubmissionsAndStudents = async () => {
    try {
      setLoading(true);
      console.log('Loading submissions and eligible students for assignment:', assignment.id);

      // Get eligible students based on semester and section matching
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, login_id, semester, section')
        .eq('semester', assignment.semester)
        .eq('section', assignment.section);

      if (studentsError) {
        console.error('Error loading students:', studentsError);
        throw studentsError;
      }

      console.log('Eligible students found:', studentsData?.length || 0);

      // Get all submissions for this assignment with explicit column selection
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('student_submissions')
        .select(`
          id,
          student_id,
          assignment_id,
          submitted_at,
          total_score,
          grading_status,
          attempt_number,
          is_late
        `)
        .eq('assignment_id', assignment.id)
        .neq('grading_status', 'draft')
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        console.error('Error loading submissions:', submissionsError);
        throw submissionsError;
      }

      console.log('Loaded submissions:', submissionsData?.length || 0);

      // Create a map of submissions by student_id
      const submissionMap = new Map();
      (submissionsData || []).forEach(submission => {
        submissionMap.set(submission.student_id, submission);
      });

      // Transform submissions with student details
      const submissionsWithStudents: StudentSubmission[] = [];
      const eligibleStudentsList: EligibleStudent[] = [];

      (studentsData || []).forEach(student => {
        const submission = submissionMap.get(student.id);
        
        eligibleStudentsList.push({
          student_id: student.id,
          student_name: student.name,
          student_login_id: student.login_id,
          has_submitted: !!submission
        });

        if (submission) {
          submissionsWithStudents.push({
            id: submission.id,
            student_id: student.id,
            student_name: student.name,
            student_login_id: student.login_id,
            submitted_at: submission.submitted_at,
            total_score: submission.total_score,
            grading_status: submission.grading_status,
            attempt_number: submission.attempt_number,
            is_late: submission.is_late || false
          });
        }
      });

      setSubmissions(submissionsWithStudents);
      setEligibleStudents(eligibleStudentsList);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportSubmissions = () => {
    if (submissions.length === 0) {
      toast({
        title: "No Data",
        description: "No submissions to export",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Student Name', 'Student ID', 'Submitted At', 'Score', 'Status', 'Attempt', 'Late'].join(','),
      ...submissions.map(sub => [
        sub.student_name,
        sub.student_login_id,
        format(new Date(sub.submitted_at), 'yyyy-MM-dd HH:mm'),
        sub.total_score || 0,
        sub.grading_status,
        sub.attempt_number,
        sub.is_late ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignment.title}-submissions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Submissions exported successfully",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'auto_graded':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'auto_graded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.student_login_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEligibleStudents = eligibleStudents.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_login_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: eligibleStudents.length,
    completed: submissions.filter(s => s.grading_status === 'completed').length,
    pending: submissions.filter(s => s.grading_status === 'pending').length,
    auto_graded: submissions.filter(s => s.grading_status === 'auto_graded').length,
    submitted: submissions.length,
    not_submitted: eligibleStudents.length - submissions.length,
    average_score: submissions.length > 0 
      ? submissions.reduce((sum, s) => sum + (s.total_score || 0), 0) / submissions.length 
      : 0
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assignment Overview - {assignment.title}</DialogTitle>
          <p className="text-sm text-gray-600">
            Semester {assignment.semester} - Section {assignment.section}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Students</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Submitted</p>
                    <p className="text-2xl font-bold text-green-900">{stats.submitted}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Not Submitted</p>
                    <p className="text-2xl font-bold text-red-900">{stats.not_submitted}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-700">Graded</p>
                    <p className="text-2xl font-bold text-indigo-900">{stats.completed}</p>
                  </div>
                  <FileText className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Avg Score</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.average_score.toFixed(1)}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowAllStudents(!showAllStudents)}
                variant={showAllStudents ? "default" : "outline"}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showAllStudents ? 'Show Submissions Only' : 'Show All Students'}
              </Button>
              <Button onClick={exportSubmissions} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Student List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {showAllStudents ? (
                // Show all eligible students
                filteredEligibleStudents.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'No matching students' : 'No eligible students'}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search terms' : 'No students are eligible for this assignment'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredEligibleStudents.map((student) => {
                    const submission = submissions.find(s => s.student_id === student.student_id);
                    return (
                      <Card key={student.student_id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-lg">{student.student_name}</h4>
                                <Badge variant="outline">{student.student_login_id}</Badge>
                                {student.has_submitted ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Submitted
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Not Submitted
                                  </Badge>
                                )}
                              </div>
                              {submission && (
                                <div className="flex items-center space-x-6 text-sm text-gray-600">
                                  <span>Submitted: {format(new Date(submission.submitted_at), 'MMM d, yyyy HH:mm')}</span>
                                  <span>Score: {submission.total_score || 0}/{assignment.total_marks}</span>
                                  <span>Status: {submission.grading_status}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )
              ) : (
                // Show only submissions
                filteredSubmissions.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'No matching submissions' : 'No submissions yet'}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search terms' : 'Students haven\'t submitted yet'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <Card key={submission.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-lg">{submission.student_name}</h4>
                              <Badge variant="outline">{submission.student_login_id}</Badge>
                              <Badge className={getStatusColor(submission.grading_status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(submission.grading_status)}
                                  <span className="capitalize">{submission.grading_status.replace('_', ' ')}</span>
                                </div>
                              </Badge>
                              {submission.is_late && (
                                <Badge variant="destructive">Late</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span>Submitted: {format(new Date(submission.submitted_at), 'MMM d, yyyy HH:mm')}</span>
                              <span>Attempt: {submission.attempt_number}</span>
                              <span>Score: {submission.total_score || 0}/{assignment.total_marks}</span>
                              <span>
                                Percentage: {assignment.total_marks > 0 
                                  ? Math.round(((submission.total_score || 0) / assignment.total_marks) * 100) 
                                  : 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmissions;
