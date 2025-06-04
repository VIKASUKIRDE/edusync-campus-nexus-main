
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateAssignmentProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'essay' | 'file_upload';
  options?: { [key: string]: string };
  correct_answer?: string;
  marks: number;
  order_number: number;
  explanation?: string;
  rubric?: string;
}

const CreateAssignment: React.FC<CreateAssignmentProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    assignment_type: 'assignment',
    total_marks: 100,
    deadline: '',
    semester: '',
    section: '',
    subject_id: '',
    late_submission_allowed: false,
    late_penalty_percentage: 0,
    max_attempts: 1,
    duration_minutes: 60,
    auto_grade_mcq: true,
    rubric_enabled: false
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadSubjects();
    }
  }, [open]);

  const loadSubjects = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('employee_id', currentUser.employee_id || 'TCH001')
        .single();

      if (teacher) {
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('*')
          .eq('teacher_id', teacher.id);

        setSubjects(subjectsData || []);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      question_text: '',
      question_type: 'mcq',
      options: { A: '', B: '', C: '', D: '' },
      correct_answer: '',
      marks: 1,
      order_number: questions.length + 1,
      explanation: '',
      rubric: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);

    // Update total marks
    const totalMarks = updatedQuestions.reduce((sum, q) => sum + q.marks, 0);
    setFormData(prev => ({ ...prev, total_marks: totalMarks }));
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);

    // Update total marks
    const totalMarks = updatedQuestions.reduce((sum, q) => sum + q.marks, 0);
    setFormData(prev => ({ ...prev, total_marks: totalMarks }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.deadline || !formData.semester || !formData.section) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('employee_id', currentUser.employee_id || 'TCH001')
        .single();

      if (!teacher) {
        throw new Error('Teacher not found');
      }

      // Create assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          ...formData,
          teacher_id: teacher.id,
          status: 'draft'
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create questions if any
      if (questions.length > 0) {
        const questionsToInsert = questions.map(q => ({
          assignment_id: assignment.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          marks: q.marks,
          order_number: q.order_number,
          explanation: q.explanation,
          rubric: q.rubric
        }));

        const { error: questionsError } = await supabase
          .from('assignment_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      toast({
        title: "Success",
        description: "Assignment created successfully",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
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
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Assignment title"
                  />
                </div>
                <div>
                  <Label htmlFor="assignment_type">Type</Label>
                  <Select value={formData.assignment_type} onValueChange={(value) => setFormData(prev => ({ ...prev, assignment_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Assignment description"
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Detailed instructions for students"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="subject_id">Subject</Label>
                  <Select value={formData.subject_id} onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="semester">Semester *</Label>
                  <Input
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                    placeholder="e.g., 1, 2, 3"
                  />
                </div>
                <div>
                  <Label htmlFor="section">Section *</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    placeholder="e.g., A, B, C"
                  />
                </div>
                <div>
                  <Label htmlFor="total_marks">Total Marks</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_marks: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="late_submission_allowed"
                    checked={formData.late_submission_allowed}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, late_submission_allowed: checked }))}
                  />
                  <Label htmlFor="late_submission_allowed">Allow Late Submissions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_grade_mcq"
                    checked={formData.auto_grade_mcq}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_grade_mcq: checked }))}
                  />
                  <Label htmlFor="auto_grade_mcq">Auto-grade MCQs</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Questions</CardTitle>
              <Button onClick={addQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="border border-gray-200">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Question {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Question Type</Label>
                        <Select 
                          value={question.question_type} 
                          onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="short_answer">Short Answer</SelectItem>
                            <SelectItem value="essay">Essay</SelectItem>
                            <SelectItem value="file_upload">File Upload</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Marks</Label>
                        <Input
                          type="number"
                          value={question.marks}
                          onChange={(e) => updateQuestion(index, 'marks', parseInt(e.target.value) || 1)}
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                        placeholder="Enter your question"
                      />
                    </div>

                    {question.question_type === 'mcq' && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {Object.entries(question.options || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <span className="w-6 text-center font-medium">{key}:</span>
                            <Input
                              value={value}
                              onChange={(e) => {
                                const newOptions = { ...question.options, [key]: e.target.value };
                                updateQuestion(index, 'options', newOptions);
                              }}
                              placeholder={`Option ${key}`}
                            />
                          </div>
                        ))}
                        <div>
                          <Label>Correct Answer</Label>
                          <Select 
                            value={question.correct_answer} 
                            onValueChange={(value) => updateQuestion(index, 'correct_answer', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(question.options || {}).map((key) => (
                                <SelectItem key={key} value={key}>{key}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {question.question_type !== 'mcq' && (
                      <div>
                        <Label>Grading Rubric</Label>
                        <Textarea
                          value={question.rubric}
                          onChange={(e) => updateQuestion(index, 'rubric', e.target.value)}
                          placeholder="Enter grading criteria and rubric"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignment;
