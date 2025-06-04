
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock, Save, Send, Award, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentStudent } from '@/hooks/useCurrentStudent';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  deadline: string;
  total_marks: number;
  assignment_type: string;
  duration_minutes?: number;
  max_attempts?: number;
}

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'essay' | 'file_upload';
  options?: { [key: string]: string } | null;
  marks: number;
  order_number: number;
}

interface StudentAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

const StudentAssignmentModal: React.FC<StudentAssignmentModalProps> = ({ 
  open, 
  onClose, 
  assignment 
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [fileUploads, setFileUploads] = useState<{ [key: string]: File | null }>({});
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime] = useState(new Date());
  
  const { currentStudent } = useCurrentStudent();
  const { toast } = useToast();

  useEffect(() => {
    if (open && assignment) {
      loadAssignmentData();
    } else {
      // Reset state when modal closes
      setQuestions([]);
      setAnswers({});
      setFileUploads({});
      setSubmission(null);
      setTimeLeft(null);
    }
  }, [open, assignment]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          handleSubmit(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!open || !assignment || !currentStudent) return;

    const autoSaveInterval = setInterval(() => {
      if (Object.keys(answers).length > 0 && !submitting && !savingDraft) {
        saveDraft(true); // Silent auto-save
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [open, assignment, currentStudent, answers, submitting, savingDraft]);

  const loadAssignmentData = async () => {
    if (!assignment || !currentStudent) return;

    try {
      setLoading(true);
      console.log('Loading assignment data for:', assignment.id);

      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('assignment_questions')
        .select('*')
        .eq('assignment_id', assignment.id)
        .order('order_number');

      if (questionsError) {
        console.error('Error loading questions:', questionsError);
        throw questionsError;
      }

      console.log('Loaded questions:', questionsData);

      // Transform questions to match our interface
      const transformedQuestions: Question[] = (questionsData || []).map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as 'mcq' | 'short_answer' | 'essay' | 'file_upload',
        options: q.options as { [key: string]: string } | null,
        marks: q.marks,
        order_number: q.order_number
      }));

      setQuestions(transformedQuestions);

      // Check for existing submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('assignment_id', assignment.id)
        .eq('student_id', currentStudent.id)
        .order('attempt_number', { ascending: false })
        .limit(1);

      if (submissionError) {
        console.error('Error loading submission:', submissionError);
        throw submissionError;
      }

      console.log('Loaded submission:', submissionData);

      if (submissionData && submissionData.length > 0) {
        const existingSubmission = submissionData[0];
        setSubmission(existingSubmission);
        
        // Handle different types of answers data
        let existingAnswers = {};
        if (existingSubmission.answers) {
          if (typeof existingSubmission.answers === 'string') {
            try {
              existingAnswers = JSON.parse(existingSubmission.answers);
            } catch (e) {
              console.error('Error parsing answers:', e);
              existingAnswers = {};
            }
          } else if (typeof existingSubmission.answers === 'object') {
            existingAnswers = existingSubmission.answers as { [key: string]: string };
          }
        }
        setAnswers(existingAnswers);
      } else {
        // Set timer for new submission
        if (assignment.duration_minutes) {
          setTimeLeft(assignment.duration_minutes * 60);
        }
      }
    } catch (error: any) {
      console.error('Error loading assignment data:', error);
      toast({
        title: "Error",
        description: "Failed to load assignment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleFileUpload = (questionId: string, file: File | null) => {
    setFileUploads(prev => ({ ...prev, [questionId]: file }));
    if (file) {
      handleAnswerChange(questionId, file.name);
    }
  };

  const saveDraft = async (silent = false) => {
    if (!assignment || !currentStudent || savingDraft) return;

    try {
      if (!silent) setSavingDraft(true);
      console.log('Saving draft...');

      // Prepare file attachments
      const fileAttachments: { [key: string]: string } = {};
      for (const [questionId, file] of Object.entries(fileUploads)) {
        if (file) {
          fileAttachments[questionId] = file.name;
        }
      }

      const draftData = {
        assignment_id: assignment.id,
        student_id: currentStudent.id,
        answers: answers,
        file_attachments: Object.keys(fileAttachments).length > 0 ? fileAttachments : null,
        attempt_number: submission ? submission.attempt_number : 1,
        started_at: startTime.toISOString(),
        grading_status: 'draft',
        submitted_at: null,
        total_score: null
      };

      let result;
      if (submission && submission.grading_status === 'draft') {
        // Update existing draft
        result = await supabase
          .from('student_submissions')
          .update(draftData)
          .eq('id', submission.id)
          .select()
          .single();
      } else if (!submission || submission.grading_status !== 'draft') {
        // Create new draft
        result = await supabase
          .from('student_submissions')
          .insert(draftData)
          .select()
          .single();
      }

      if (result?.error) {
        console.error('Draft save error:', result.error);
        throw result.error;
      }

      if (result?.data) {
        setSubmission(result.data);
      }

      if (!silent) {
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved",
        });
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      if (!silent) {
        toast({
          title: "Error",
          description: `Failed to save draft: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setSavingDraft(false);
    }
  };

  const validateSubmission = () => {
    const errors = [];
    
    // Check if all required questions are answered
    for (const question of questions) {
      const answer = answers[question.id];
      if (!answer || answer.trim() === '') {
        errors.push(`Question ${question.order_number} is required`);
      }
    }

    return errors;
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!assignment || !currentStudent) return;

    try {
      setSubmitting(true);
      console.log('Submitting assignment...');

      // Validate submission
      const validationErrors = validateSubmission();
      if (validationErrors.length > 0 && !autoSubmit) {
        toast({
          title: "Validation Error",
          description: validationErrors.join(', '),
          variant: "destructive",
        });
        return;
      }

      const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);

      // Prepare file attachments
      const fileAttachments: { [key: string]: string } = {};
      for (const [questionId, file] of Object.entries(fileUploads)) {
        if (file) {
          fileAttachments[questionId] = file.name;
        }
      }

      const submissionData = {
        assignment_id: assignment.id,
        student_id: currentStudent.id,
        answers: answers,
        file_attachments: Object.keys(fileAttachments).length > 0 ? fileAttachments : null,
        time_taken_minutes: timeTaken,
        attempt_number: submission ? submission.attempt_number : 1,
        started_at: startTime.toISOString(),
        submitted_at: new Date().toISOString(),
        grading_status: 'pending',
        is_late: new Date() > new Date(assignment.deadline),
        total_score: null
      };

      let result;
      if (submission && submission.grading_status === 'draft') {
        // Update existing draft to submitted
        result = await supabase
          .from('student_submissions')
          .update(submissionData)
          .eq('id', submission.id)
          .select()
          .single();
      } else {
        // Create new submission
        result = await supabase
          .from('student_submissions')
          .insert(submissionData)
          .select()
          .single();
      }

      if (result?.error) {
        console.error('Submission error:', result.error);
        throw result.error;
      }

      console.log('Submission successful:', result.data);

      toast({
        title: "Success",
        description: autoSubmit ? "Assignment auto-submitted due to time limit" : "Assignment submitted successfully",
      });

      onClose();
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Error",
        description: `Failed to submit assignment: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isSubmitted = submission !== null && submission.grading_status !== 'draft';
  const canSubmit = !isSubmitted && Object.keys(answers).length > 0;

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{assignment.title}</DialogTitle>
            <div className="flex items-center space-x-4">
              {timeLeft !== null && timeLeft > 0 && !isSubmitted && (
                <Badge variant="outline" className="text-orange-700 border-orange-200">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(timeLeft)}
                </Badge>
              )}
              {isSubmitted && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Submitted
                </Badge>
              )}
              {submission && submission.grading_status === 'draft' && (
                <Badge variant="outline" className="text-blue-700 border-blue-200">
                  <Save className="h-4 w-4 mr-1" />
                  Draft Saved
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assignment.description && (
                <p className="text-gray-700">{assignment.description}</p>
              )}
              {assignment.instructions && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                  <p className="text-blue-800 text-sm">{assignment.instructions}</p>
                </div>
              )}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>Total Marks: {assignment.total_marks}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Due: {format(new Date(assignment.deadline), 'MMM d, yyyy h:mm a')}</span>
                </div>
                {assignment.duration_minutes && (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>Duration: {assignment.duration_minutes} minutes</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submission Info */}
          {isSubmitted && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900">Submission Details</h4>
                    <p className="text-green-700 text-sm">
                      Submitted on {format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    <p className="text-green-700 text-sm">
                      Attempt #{submission.attempt_number} • Time taken: {submission.time_taken_minutes} minutes
                    </p>
                  </div>
                  {submission.total_score !== null && submission.total_score !== undefined && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-900">
                        {submission.total_score}/{assignment.total_marks}
                      </div>
                      <div className="text-sm text-green-700">Score</div>
                    </div>
                  )}
                </div>
                {submission.teacher_feedback && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h5 className="font-semibold text-gray-900 mb-1">Teacher Feedback:</h5>
                    <p className="text-gray-700 text-sm">{submission.teacher_feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Questions */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No questions found for this assignment</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <Card key={question.id} className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Question {index + 1} ({question.marks} mark{question.marks !== 1 ? 's' : ''})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{question.question_text}</p>

                    {question.question_type === 'mcq' && question.options && (
                      <RadioGroup
                        value={answers[question.id] || ''}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                        disabled={isSubmitted}
                      >
                        {Object.entries(question.options).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <RadioGroupItem value={key} id={`${question.id}-${key}`} />
                            <Label htmlFor={`${question.id}-${key}`} className="flex-1">
                              <strong>{key}:</strong> {value}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {(question.question_type === 'short_answer' || question.question_type === 'essay') && (
                      <Textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder={`Enter your ${question.question_type === 'essay' ? 'essay' : 'answer'} here...`}
                        rows={question.question_type === 'essay' ? 6 : 3}
                        disabled={isSubmitted}
                      />
                    )}

                    {question.question_type === 'file_upload' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleFileUpload(question.id, file || null);
                          }}
                          disabled={isSubmitted}
                          className="mb-2"
                        />
                        <div className="flex items-center text-sm text-gray-500">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload your file for this question
                        </div>
                        {fileUploads[question.id] && (
                          <p className="text-sm text-green-600 mt-2">
                            Selected: {fileUploads[question.id]?.name}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Submit Button */}
          {!isSubmitted && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => saveDraft(false)}
                disabled={savingDraft || loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {savingDraft ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                onClick={() => handleSubmit()} 
                disabled={!canSubmit || submitting || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAssignmentModal;
