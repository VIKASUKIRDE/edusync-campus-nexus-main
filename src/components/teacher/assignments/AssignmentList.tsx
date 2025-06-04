
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  Users, 
  Calendar,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  assignment_type: 'assignment' | 'quiz' | 'exam' | 'project';
  total_marks: number;
  deadline: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  semester: string;
  section: string;
  created_at: string;
  subject_id: string;
  teacher_id: string;
  late_submission_allowed: boolean | null;
  late_penalty_percentage: number | null;
  max_attempts: number | null;
  duration_minutes: number | null;
  updated_at: string;
  subject_name?: string;
  submission_count?: number;
  graded_count?: number;
}

interface AssignmentListProps {
  onStatsUpdate: () => void;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ onStatsUpdate }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getCurrentTeacherId = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('id')
      .eq('employee_id', currentUser.employee_id || 'TCH001')
      .single();
      
    if (error) {
      console.error('Error fetching teacher:', error);
      return null;
    }
    
    return teacher?.id;
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) {
        toast({
          title: "Error",
          description: "Teacher not found. Please check your login.",
          variant: "destructive",
        });
        return;
      }

      // Get assignments with submission counts
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      if (!assignmentsData || assignmentsData.length === 0) {
        setAssignments([]);
        return;
      }

      // Get subject names
      const subjectIds = [...new Set(assignmentsData.map(a => a.subject_id))];
      let subjectMap = new Map();

      if (subjectIds.length > 0) {
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        if (!subjectsError && subjectsData) {
          subjectMap = new Map(subjectsData.map(s => [s.id, s.name]));
        }
      }

      // Get submission counts
      const assignmentsWithStats = await Promise.all(
        assignmentsData.map(async (assignment) => {
          const { count: submissionCount } = await supabase
            .from('student_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', assignment.id);

          const { count: gradedCount } = await supabase
            .from('student_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', assignment.id)
            .eq('grading_status', 'completed');

          return {
            ...assignment,
            subject_name: subjectMap.get(assignment.subject_id) || 'Unknown Subject',
            submission_count: submissionCount || 0,
            graded_count: gradedCount || 0
          } as Assignment;
        })
      );

      setAssignments(assignmentsWithStats);
    } catch (error: any) {
      console.error('Error loading assignments:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const updateAssignmentStatus = async (assignmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', assignmentId);

      if (error) throw error;

      await loadAssignments();
      onStatsUpdate();

      toast({
        title: "Success",
        description: `Assignment ${newStatus} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating assignment status:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive",
      });
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      await loadAssignments();
      onStatsUpdate();

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'QUIZ';
      case 'exam':
        return 'EXAM';
      case 'project':
        return 'PROJ';
      default:
        return 'ASSG';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600 mb-4">Create your first assignment to get started</p>
          </CardContent>
        </Card>
      ) : (
        assignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {assignment.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {getTypeIcon(assignment.assignment_type)}
                    </Badge>
                    <Badge className={getStatusColor(assignment.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(assignment.status)}
                        <span className="capitalize">{assignment.status}</span>
                      </div>
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {format(new Date(assignment.deadline), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{assignment.submission_count} submissions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{assignment.graded_count} graded</span>
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
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Submissions
                    </DropdownMenuItem>
                    {assignment.status === 'draft' && (
                      <DropdownMenuItem 
                        onClick={() => updateAssignmentStatus(assignment.id, 'published')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    {assignment.status === 'published' && (
                      <DropdownMenuItem 
                        onClick={() => updateAssignmentStatus(assignment.id, 'closed')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Close
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => deleteAssignment(assignment.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <p><span className="font-medium">Subject:</span> {assignment.subject_name}</p>
                  <p><span className="font-medium">Class:</span> {assignment.semester} - {assignment.section}</p>
                  <p><span className="font-medium">Total Marks:</span> {assignment.total_marks}</p>
                </div>
                <div className="text-right space-y-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Submissions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AssignmentList;
