
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, BookOpen, Award, Play, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentStudent } from '@/hooks/useCurrentStudent';
import StudentAssignmentModal from './assignments/StudentAssignmentModal';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  total_marks: number;
  status: string;
  assignment_type: string;
  semester: string;
  section: string;
  subjects?: {
    name: string;
    code: string;
  } | null;
}

interface Submission {
  id: string;
  assignment_id: string;
  submitted_at: string;
  total_score?: number;
  grading_status: string;
  attempt_number: number;
}

const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { currentStudent, loading: studentLoading } = useCurrentStudent();
  const { toast } = useToast();

  const loadAssignments = async () => {
    if (!currentStudent) {
      console.log('No current student found');
      setAssignmentsLoading(false);
      return;
    }

    try {
      setAssignmentsLoading(true);
      console.log('Loading assignments for student:', currentStudent);

      // Normalize student semester and section for matching
      const studentSemester = currentStudent.semester.replace(/[^0-9]/g, '');
      const studentSection = currentStudent.section.replace(/[^A-Z]/g, '').toUpperCase();

      console.log('Normalized student data:', { studentSemester, studentSection });

      // Load assignments for student's semester and section
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          subjects (
            name,
            code
          )
        `)
        .eq('semester', studentSemester)
        .eq('section', studentSection)
        .eq('status', 'published')
        .order('deadline', { ascending: true });

      if (assignmentsError) {
        console.error('Error loading assignments:', assignmentsError);
        throw assignmentsError;
      }

      console.log('Loaded assignments:', assignmentsData);

      // Load student submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('student_id', currentStudent.id);

      if (submissionsError) {
        console.error('Error loading submissions:', submissionsError);
        throw submissionsError;
      }

      console.log('Loaded submissions:', submissionsData);

      // Transform the data to match our interface
      const transformedAssignments: Assignment[] = (assignmentsData || []).map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
        total_marks: assignment.total_marks,
        status: assignment.status,
        assignment_type: assignment.assignment_type,
        semester: assignment.semester,
        section: assignment.section,
        subjects: assignment.subjects && typeof assignment.subjects === 'object' && 'name' in assignment.subjects ? {
          name: assignment.subjects.name,
          code: assignment.subjects.code
        } : null
      }));

      setAssignments(transformedAssignments);
      setSubmissions(submissionsData || []);
    } catch (error: any) {
      console.error('Error loading assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Assignment data has been updated",
    });
  };

  useEffect(() => {
    if (currentStudent) {
      console.log('Current student changed, loading assignments');
      loadAssignments();
    }
  }, [currentStudent]);

  // Set up real-time subscription for assignments
  useEffect(() => {
    if (!currentStudent) return;

    console.log('Setting up real-time subscription for assignments');
    
    const channel = supabase
      .channel('assignments-student-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments'
        },
        (payload) => {
          console.log('Assignment real-time update:', payload);
          loadAssignments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_submissions'
        },
        (payload) => {
          console.log('Submission real-time update:', payload);
          loadAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentStudent]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isSubmitted = (assignmentId: string) => {
    return submissions.some(submission => 
      submission.assignment_id === assignmentId && 
      submission.grading_status !== 'draft'
    );
  };

  const getSubmission = (assignmentId: string) => {
    return submissions.find(submission => submission.assignment_id === assignmentId);
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = getSubmission(assignment.id);
    if (!submission) return 'Not Started';
    
    if (submission.grading_status === 'draft') return 'Draft Saved';
    
    switch (submission.grading_status) {
      case 'pending':
        return 'Submitted';
      case 'auto_graded':
        return 'Auto-graded';
      case 'completed':
        return 'Graded';
      default:
        return 'Submitted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return '🧠';
      case 'exam':
        return '📝';
      case 'project':
        return '🎯';
      default:
        return '📋';
    }
  };

  if (studentLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-gray-500">Unable to load student information</p>
          <p className="text-sm mt-2">Please check your login credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header - Orange Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">My Assignments</h1>
              <p className="text-orange-100">
                Complete your assignments and track your progress
              </p>
              <p className="text-orange-200 text-sm mt-1">
                Semester {currentStudent.semester} - Section {currentStudent.section}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="text-right">
              <div className="text-3xl font-bold">{assignments.length}</div>
              <div className="text-orange-100 text-sm">Total Assignments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments available</h3>
            <p className="text-gray-600">Your assignments will appear here once they're published</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const submission = getSubmission(assignment.id);
            const submitted = isSubmitted(assignment.id);
            const status = getAssignmentStatus(assignment);
            
            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getTypeIcon(assignment.assignment_type)}</span>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {assignment.title}
                        </CardTitle>
                      </div>
                      <p className="text-gray-600 text-sm">{assignment.description}</p>
                    </div>
                    <Badge className={getStatusColor(status.toLowerCase())}>
                      {status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {format(new Date(assignment.deadline), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                    
                    {assignment.subjects && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>{assignment.subjects.name} ({assignment.subjects.code})</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="h-4 w-4" />
                      <span>Total Marks: {assignment.total_marks}</span>
                    </div>
                  </div>

                  {submitted && submission && submission.grading_status !== 'draft' && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Submitted on {format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a')}
                          </p>
                          <p className="text-xs text-blue-700">
                            Attempt #{submission.attempt_number}
                          </p>
                        </div>
                        {submission.total_score !== null && submission.total_score !== undefined && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-900">
                              {submission.total_score}/{assignment.total_marks}
                            </div>
                            <div className="text-xs text-blue-700">Score</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {submission && submission.grading_status === 'draft' && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-900">
                            Draft saved - Continue working
                          </p>
                          <p className="text-xs text-yellow-700">
                            You can continue from where you left off
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">Semester {assignment.semester}</Badge>
                      <Badge variant="outline">Section {assignment.section}</Badge>
                    </div>
                    
                    <Button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowModal(true);
                      }}
                      className={
                        submitted && submission?.grading_status !== 'draft'
                          ? "bg-green-600 hover:bg-green-700" 
                          : submission?.grading_status === 'draft'
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {submitted && submission?.grading_status !== 'draft' 
                        ? 'View Submission' 
                        : submission?.grading_status === 'draft'
                        ? 'Continue Assignment'
                        : 'Start Assignment'
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <StudentAssignmentModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAssignment(null);
          loadAssignments();
        }}
        assignment={selectedAssignment}
      />
    </div>
  );
};

export default StudentAssignments;
