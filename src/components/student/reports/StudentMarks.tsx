
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, TrendingUp, Award, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useStudentData } from '@/hooks/useStudentData';
import { useToast } from '@/hooks/use-toast';

interface StudentMark {
  id: string;
  subject_id: string;
  internal_marks: number;
  practical_marks: number;
  assignment_marks: number;
  total_marks: number;
  semester: string;
  section: string;
  created_at: string;
  updated_at: string;
  subject_name?: string;
  subject_code?: string;
}

const StudentMarks: React.FC = () => {
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentStudent } = useStudentData();
  const { toast } = useToast();

  const loadMarks = async () => {
    if (!currentStudent?.id) return;

    try {
      setLoading(true);

      // First get the marks
      const { data: marksData, error: marksError } = await supabase
        .from('student_marks')
        .select('*')
        .eq('student_id', currentStudent.id)
        .order('updated_at', { ascending: false });

      if (marksError) throw marksError;

      // Then get the subjects data separately
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, code');

      if (subjectsError) throw subjectsError;

      // Combine the data
      const marksWithSubjects = (marksData || []).map(mark => {
        const subject = subjectsData?.find(s => s.id === mark.subject_id);
        return {
          ...mark,
          subject_name: subject?.name || 'Unknown Subject',
          subject_code: subject?.code || 'N/A'
        };
      });

      setMarks(marksWithSubjects);
    } catch (error: any) {
      console.error('Error loading marks:', error);
      toast({
        title: "Error",
        description: "Failed to load marks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarks();
  }, [currentStudent?.id]);

  const exportMarks = () => {
    if (marks.length === 0) {
      toast({
        title: "No Data",
        description: "No marks available to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Subject Code', 'Subject Name', 'Internal Marks', 'Practical Marks', 'Assignment Marks', 'Total Marks', 'Semester'],
      ...marks.map(mark => [
        mark.subject_code || 'N/A',
        mark.subject_name || 'N/A',
        mark.internal_marks.toString(),
        mark.practical_marks.toString(),
        mark.assignment_marks.toString(),
        mark.total_marks?.toString() || '0',
        mark.semester
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marks_${currentStudent?.name || 'student'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Marks exported successfully",
    });
  };

  const calculateAverage = (marks: StudentMark[]) => {
    if (marks.length === 0) return 0;
    const total = marks.reduce((sum, mark) => sum + (mark.total_marks || 0), 0);
    return Math.round(total / marks.length);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    return 'F';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const averageMarks = calculateAverage(marks);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Marks & Reports</h2>
          <p className="text-gray-600">View your academic performance and download reports</p>
        </div>
        <Button onClick={exportMarks} disabled={marks.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export Marks
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Subjects</p>
                <p className="text-2xl font-bold">{marks.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Marks</p>
                <p className="text-2xl font-bold">{averageMarks}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overall Grade</p>
                <p className="text-2xl font-bold">{getGrade(averageMarks)}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Marks</CardTitle>
        </CardHeader>
        <CardContent>
          {marks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No marks have been updated by teachers yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Internal</TableHead>
                  <TableHead>Practical</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marks.map((mark) => {
                  const percentage = mark.total_marks || 0;
                  return (
                    <TableRow key={mark.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{mark.subject_name}</div>
                          <div className="text-sm text-gray-500">{mark.subject_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{mark.internal_marks}</TableCell>
                      <TableCell>{mark.practical_marks}</TableCell>
                      <TableCell>{mark.assignment_marks}</TableCell>
                      <TableCell className="font-medium">{mark.total_marks || 0}</TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(percentage)}>
                          {getGrade(percentage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(mark.updated_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMarks;
