import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, Award, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssignmentReport {
  id: string;
  title: string;
  total_marks: number;
  submission_count: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  completion_rate: number;
}

interface ScoreDistribution {
  range: string;
  count: number;
}

const AssignmentReports: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentReport[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadAssignmentReports();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      loadScoreDistribution(selectedAssignment);
    }
  }, [selectedAssignment]);

  const getCurrentTeacherId = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('employee_id', currentUser.employee_id || 'TCH001')
      .single();
    return teacher?.id;
  };

  const loadAssignmentReports = async () => {
    try {
      setLoading(true);
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) return;

      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select('id, title, total_marks')
        .eq('teacher_id', teacherId)
        .eq('status', 'published');

      if (error) throw error;

      const reportsWithStats = await Promise.all(
        assignmentsData?.map(async (assignment) => {
          // Get submission statistics
          const { data: submissions, error: submissionsError } = await supabase
            .from('student_submissions')
            .select('total_score')
            .eq('assignment_id', assignment.id)
            .not('total_score', 'is', null);

          if (submissionsError) throw submissionsError;

          const scores = submissions?.map(s => s.total_score) || [];
          const submissionCount = scores.length;
          const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
          const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
          const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

          // Calculate completion rate (this would need student enrollment data)
          const completionRate = submissionCount > 0 ? (submissionCount / 30) * 100 : 0; // Assuming 30 students

          return {
            ...assignment,
            submission_count: submissionCount,
            average_score: Math.round(averageScore * 100) / 100,
            highest_score: highestScore,
            lowest_score: lowestScore,
            completion_rate: Math.min(completionRate, 100)
          };
        }) || []
      );

      setAssignments(reportsWithStats);
      if (reportsWithStats.length > 0 && !selectedAssignment) {
        setSelectedAssignment(reportsWithStats[0].id);
      }
    } catch (error: any) {
      console.error('Error loading assignment reports:', error);
      toast({
        title: "Error",
        description: "Failed to load assignment reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadScoreDistribution = async (assignmentId: string) => {
    try {
      const { data: submissions, error } = await supabase
        .from('student_submissions')
        .select('total_score')
        .eq('assignment_id', assignmentId)
        .not('total_score', 'is', null);

      if (error) throw error;

      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) return;

      const scores = submissions?.map(s => s.total_score) || [];
      const totalMarks = assignment.total_marks;

      // Create score ranges
      const ranges = [
        { range: '90-100%', min: totalMarks * 0.9, max: totalMarks },
        { range: '80-89%', min: totalMarks * 0.8, max: totalMarks * 0.89 },
        { range: '70-79%', min: totalMarks * 0.7, max: totalMarks * 0.79 },
        { range: '60-69%', min: totalMarks * 0.6, max: totalMarks * 0.69 },
        { range: 'Below 60%', min: 0, max: totalMarks * 0.59 }
      ];

      const distribution = ranges.map(range => ({
        range: range.range,
        count: scores.filter(score => score >= range.min && score <= range.max).length
      }));

      setScoreDistribution(distribution);
    } catch (error: any) {
      console.error('Error loading score distribution:', error);
    }
  };

  const exportReport = async () => {
    if (!selectedAssignment) return;

    const assignment = assignments.find(a => a.id === selectedAssignment);
    if (!assignment) return;

    try {
      const { data: submissions, error } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('assignment_id', selectedAssignment)
        .order('total_score', { ascending: false });

      if (error) throw error;

      // Get student names separately
      const studentIds = submissions?.map(s => s.student_id) || [];
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name, login_id')
        .in('id', studentIds);

      const studentMap = new Map(studentsData?.map(s => [s.id, { name: s.name, login_id: s.login_id }]) || []);

      // Create CSV content
      const csvContent = [
        ['Student Name', 'Student ID', 'Score', 'Percentage', 'Status', 'Submitted At'].join(','),
        ...submissions?.map(sub => {
          const student = studentMap.get(sub.student_id);
          return [
            student?.name || 'Unknown',
            student?.login_id || 'N/A',
            sub.total_score || 0,
            `${Math.round((sub.total_score / assignment.total_marks) * 100)}%`,
            sub.grading_status,
            new Date(sub.submitted_at).toLocaleDateString()
          ].join(',');
        }) || []
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${assignment.title}-report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error: any) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedAssignmentData = assignments.find(a => a.id === selectedAssignment);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Assignment Reports</h3>
        <div className="flex items-center space-x-4">
          <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select assignment" />
            </SelectTrigger>
            <SelectContent>
              {assignments.map((assignment) => (
                <SelectItem key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportReport} disabled={!selectedAssignment}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {selectedAssignmentData && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Submissions</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{selectedAssignmentData.submission_count}</div>
                <p className="text-xs text-blue-600 mt-1">
                  {selectedAssignmentData.completion_rate.toFixed(1)}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{selectedAssignmentData.average_score}</div>
                <p className="text-xs text-green-600 mt-1">
                  {Math.round((selectedAssignmentData.average_score / selectedAssignmentData.total_marks) * 100)}% average
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Highest Score</CardTitle>
                <Award className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{selectedAssignmentData.highest_score}</div>
                <p className="text-xs text-purple-600 mt-1">
                  {Math.round((selectedAssignmentData.highest_score / selectedAssignmentData.total_marks) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Lowest Score</CardTitle>
                <FileText className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{selectedAssignmentData.lowest_score}</div>
                <p className="text-xs text-orange-600 mt-1">
                  {Math.round((selectedAssignmentData.lowest_score / selectedAssignmentData.total_marks) * 100)}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, count }) => `${range}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Assignment List Overview */}
          <Card>
            <CardHeader>
              <CardTitle>All Assignments Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      assignment.id === selectedAssignment
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAssignment(assignment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{assignment.title}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{assignment.submission_count} submissions</span>
                          <span>Avg: {assignment.average_score}/{assignment.total_marks}</span>
                          <Badge variant="outline">
                            {assignment.completion_rate.toFixed(1)}% completion
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {Math.round((assignment.average_score / assignment.total_marks) * 100)}%
                        </div>
                        <div className="text-sm text-gray-500">Average</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {assignments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No published assignments</h3>
            <p className="text-gray-600">Create and publish assignments to view reports</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentReports;
