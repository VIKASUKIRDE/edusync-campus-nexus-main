
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  Save,
  ChevronRight,
  Award,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  attempt_number: number;
  answers: any;
  submitted_at: string;
  auto_graded_score: number;
  manual_graded_score: number;
  total_score: number;
  grading_status: string;
  teacher_feedback: string;
  is_late: boolean;
  student_name?: string;
  assignment_title?: string;
  assignment_total_marks?: number;
  questions?: any[];
  file_attachments?: any;
}

interface SubmissionGradingProps {
  onStatsUpdate: () => void;
}

const SubmissionGrading: React.FC<SubmissionGradingProps> = ({ onStatsUpdate }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grading, setGrading] = useState<{ [key: string]: number }>({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const { toast } = useToast();

  const getCurrentTeacherId = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('employee_id', currentUser.employee_id || 'TCH001')
      .single();
    return teacher?.id;
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) return;

      const statusFilter = filterStatus === 'pending' 
        ? ['pending', 'auto_graded'] 
        : [filterStatus];

      // Get submissions for teacher's assignments
      const { data: teacherAssignments } = await supabase
        .from('assignments')
        .select('id, title, total_marks')
        .eq('teacher_id', teacherId);

      if (!teacherAssignments || teacherAssignments.length === 0) {
        setSubmissions([]);
        return;
      }

      const assignmentIds = teacherAssignments.map(a => a.id);
      const assignmentMap = new Map(teacherAssignments.map(a => [a.id, a]));

      const { data: submissionsData, error } = await supabase
        .from('student_submissions')
        .select('*')
        .in('assignment_id', assignmentIds)
        .in('grading_status', statusFilter)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Get student names
      const studentIds = submissionsData?.map(s => s.student_id) || [];
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name')
        .in('id', studentIds);

      const studentNamesMap = new Map(studentsData?.map(s => [s.id, s.name]) || []);

      const enrichedSubmissions = submissionsData?.map(submission => {
        const assignment = assignmentMap.get(submission.assignment_id);
        return {
          ...submission,
          student_name: studentNamesMap.get(submission.student_id) || 'Unknown',
          assignment_title: assignment?.title || 'Unknown Assignment',
          assignment_total_marks: assignment?.total_marks || 0
        };
      }) || [];

      setSubmissions(enrichedSubmissions);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus]);

  const loadSubmissionDetails = async (submission: Submission) => {
    try {
      // Load assignment questions
      const { data: questions, error } = await supabase
        .from('assignment_questions')
        .select('*')
        .eq('assignment_id', submission.assignment_id)
        .order('order_number');

      if (error) throw error;

      // Load existing grades if any
      const { data: existingGrades } = await supabase
        .from('question_grades')
        .select('*')
        .eq('submission_id', submission.id);

      const gradesMap: { [key: string]: number } = {};
      existingGrades?.forEach(grade => {
        gradesMap[grade.question_id] = grade.points_awarded;
      });

      setSelectedSubmission({ ...submission, questions });
      setGrading(gradesMap);
      setFeedback(submission.teacher_feedback || '');
    } catch (error: any) {
      console.error('Error loading submission details:', error);
      toast({
        title: "Error",
        description: "Failed to load submission details",
        variant: "destructive",
      });
    }
  };

  const updateQuestionGrade = (questionId: string, points: number) => {
    setGrading(prev => ({ ...prev, [questionId]: points }));
  };

  const saveGrading = async () => {
    if (!selectedSubmission) return;

    try {
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) return;

      // Calculate total manual score
      const manualScore = Object.values(grading).reduce((sum, points) => sum + points, 0);
      const totalScore = selectedSubmission.auto_graded_score + manualScore;

      // Update submission
      const { error: submissionError } = await supabase
        .from('student_submissions')
        .update({
          manual_graded_score: manualScore,
          total_score: totalScore,
          grading_status: 'completed',
          teacher_feedback: feedback,
          graded_at: new Date().toISOString(),
          graded_by: teacherId
        })
        .eq('id', selectedSubmission.id);

      if (submissionError) throw submissionError;

      // Delete existing question grades and insert new ones
      await supabase
        .from('question_grades')
        .delete()
        .eq('submission_id', selectedSubmission.id);

      if (Object.keys(grading).length > 0) {
        const gradesToInsert = Object.entries(grading).map(([questionId, points]) => ({
          submission_id: selectedSubmission.id,
          question_id: questionId,
          points_awarded: points,
          graded_by: teacherId,
          feedback: feedback
        }));

        const { error: gradesError } = await supabase
          .from('question_grades')
          .insert(gradesToInsert);

        if (gradesError) throw gradesError;
      }

      toast({
        title: "Success",
        description: "Grading saved successfully",
      });

      setSelectedSubmission(null);
      loadSubmissions();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error saving grading:', error);
      toast({
        title: "Error",
        description: "Failed to save grading",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'auto_graded':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedSubmission) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
            ← Back to Submissions
          </Button>
          <div className="flex items-center space-x-4">
            <Badge className={getStatusColor(selectedSubmission.grading_status)}>
              {selectedSubmission.grading_status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Button onClick={saveGrading}>
              <Save className="h-4 w-4 mr-2" />
              Save Grading
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{selectedSubmission.assignment_title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Student: {selectedSubmission.student_name} | 
                  Submitted: {format(new Date(selectedSubmission.submitted_at), 'MMM d, yyyy HH:mm')}
                  {selectedSubmission.is_late && <span className="text-red-600 ml-2">(Late)</span>}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {selectedSubmission.total_score || 0} / {selectedSubmission.assignment_total_marks}
                </div>
                <div className="text-sm text-gray-600">
                  Auto: {selectedSubmission.auto_graded_score} | Manual: {selectedSubmission.manual_graded_score}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedSubmission.questions?.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Question {index + 1}</h4>
                      <p className="text-gray-700 mb-3">{question.question_text}</p>
                      
                      {question.question_type === 'mcq' && (
                        <div className="space-y-2">
                          <p><strong>Options:</strong></p>
                          {Object.entries(question.options || {}).map(([key, value]) => (
                            <div key={key} className={`p-2 rounded ${
                              key === question.correct_answer ? 'bg-green-100' : 'bg-gray-50'
                            }`}>
                              <strong>{key}:</strong> {value as string}
                              {key === question.correct_answer && <span className="text-green-600 ml-2">✓ Correct</span>}
                            </div>
                          ))}
                          <div className={`p-2 rounded border ${
                            selectedSubmission.answers?.[question.id] === question.correct_answer 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-red-500 bg-red-50'
                          }`}>
                            <strong>Student Answer:</strong> {selectedSubmission.answers?.[question.id] || 'No answer'}
                            {selectedSubmission.answers?.[question.id] === question.correct_answer 
                              ? <span className="text-green-600 ml-2">✓ Correct</span>
                              : <span className="text-red-600 ml-2">✗ Incorrect</span>
                            }
                          </div>
                        </div>
                      )}

                      {(question.question_type === 'short_answer' || question.question_type === 'essay') && (
                        <div className="space-y-2">
                          <div className="bg-gray-50 p-3 rounded">
                            <strong>Student Answer:</strong>
                            <p className="mt-1">{selectedSubmission.answers?.[question.id] || 'No answer provided'}</p>
                          </div>
                          {question.rubric && (
                            <div className="bg-blue-50 p-3 rounded">
                              <strong>Grading Rubric:</strong>
                              <p className="mt-1">{question.rubric}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {question.question_type === 'file_upload' && (
                        <div className="bg-gray-50 p-3 rounded">
                          <strong>File Submission:</strong>
                          {selectedSubmission.file_attachments?.[question.id] ? (
                            <a 
                              href={selectedSubmission.file_attachments[question.id]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline ml-2"
                            >
                              View Submitted File
                            </a>
                          ) : (
                            <span className="text-gray-500 ml-2">No file submitted</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-6 w-32">
                      <Label htmlFor={`grade-${question.id}`}>Points</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id={`grade-${question.id}`}
                          type="number"
                          min="0"
                          max={question.marks}
                          value={grading[question.id] || 0}
                          onChange={(e) => updateQuestionGrade(question.id, parseInt(e.target.value) || 0)}
                          className="w-16"
                          disabled={question.question_type === 'mcq' && selectedSubmission.grading_status === 'auto_graded'}
                        />
                        <span className="text-sm text-gray-500">/ {question.marks}</span>
                      </div>
                      {question.question_type === 'mcq' && selectedSubmission.auto_graded_score > 0 && (
                        <p className="text-xs text-blue-600 mt-1">Auto-graded</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <Label htmlFor="feedback">Overall Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback to the student..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Submissions for Grading</h3>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="auto_graded">Auto-graded</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-600">No submissions requiring grading at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => loadSubmissionDetails(submission)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg">{submission.assignment_title}</h4>
                      <Badge className={getStatusColor(submission.grading_status)}>
                        {submission.grading_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {submission.is_late && (
                        <Badge variant="destructive">Late</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{submission.student_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Submitted: {format(new Date(submission.submitted_at), 'MMM d, HH:mm')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4" />
                        <span>{submission.total_score || 0} / {submission.assignment_total_marks}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Attempt {submission.attempt_number}</div>
                      {submission.auto_graded_score > 0 && (
                        <div className="text-xs text-blue-600">Auto: {submission.auto_graded_score}</div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionGrading;
