
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, TrendingUp, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  login_id: string;
  semester: string;
  section: string;
}

interface StudentReport {
  student: Student;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  attendancePercentage: number;
  totalClasses: number;
  presentClasses: number;
}

const StudentReports: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedSemester && selectedSection && selectedSubject && currentTeacherId) {
      loadStudentReports();
    }
  }, [selectedSemester, selectedSection, selectedSubject, currentTeacherId]);

  const getCurrentTeacher = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const employeeId = currentUser.employee_id || 'TCH001';
    
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('id')
      .eq('employee_id', employeeId)
      .single();

    if (teacher && !error) {
      setCurrentTeacherId(teacher.id);
      return teacher.id;
    }
    return null;
  };

  const loadInitialData = async () => {
    const teacherId = await getCurrentTeacher();
    if (teacherId) {
      await loadSubjects(teacherId);
    }
  };

  const loadSubjects = async (teacherId: string) => {
    try {
      const { data: subjectsData, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('teacher_id', teacherId);

      if (error) throw error;
      setSubjects(subjectsData || []);
    } catch (error: any) {
      console.error('Error loading subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    }
  };

  const loadStudentReports = async () => {
    try {
      setLoading(true);
      
      // First, get students who are enrolled in this specific subject
      const { data: enrolledStudents, error: enrollmentError } = await supabase
        .from('subject_enrollments')
        .select(`
          student_id,
          students (
            id,
            name,
            login_id,
            email,
            semester,
            section
          )
        `)
        .eq('subject_id', selectedSubject)
        .eq('status', 'active');

      if (enrollmentError) {
        console.error('Error loading enrolled students:', enrollmentError);
        setStudentReports([]);
        return;
      }

      if (!enrolledStudents || enrolledStudents.length === 0) {
        setStudentReports([]);
        return;
      }

      // Filter students by semester and section
      const filteredStudentData = enrolledStudents
        .map(enrollment => enrollment.students)
        .filter(student => 
          student && 
          student.semester === selectedSemester && 
          student.section === selectedSection
        );

      if (filteredStudentData.length === 0) {
        setStudentReports([]);
        return;
      }

      // Load marks configuration
      const { data: marksConfig, error: configError } = await supabase
        .from('marks_configuration')
        .select('*')
        .eq('teacher_id', currentTeacherId)
        .eq('subject_id', selectedSubject)
        .eq('semester', selectedSemester)
        .eq('section', selectedSection)
        .single();

      if (configError && configError.code !== 'PGRST116') throw configError;

      const maxMarks = marksConfig ? 
        marksConfig.max_internal_marks + marksConfig.max_practical_marks + marksConfig.max_assignment_marks : 
        300;

      // Load student marks
      const { data: marksData, error: marksError } = await supabase
        .from('student_marks')
        .select('*')
        .eq('teacher_id', currentTeacherId)
        .eq('subject_id', selectedSubject)
        .eq('semester', selectedSemester)
        .eq('section', selectedSection);

      if (marksError) throw marksError;

      // Load attendance data
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('student_id, present')
        .eq('teacher_id', currentTeacherId)
        .in('student_id', filteredStudentData.map(s => s.id));

      if (attendanceError) throw attendanceError;

      // Process data
      const reports: StudentReport[] = filteredStudentData.map(student => {
        const marks = marksData?.find(m => m.student_id === student.id);
        const totalMarks = marks ? 
          (marks.internal_marks || 0) + (marks.practical_marks || 0) + (marks.assignment_marks || 0) : 
          0;
        const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

        const studentAttendance = attendanceData?.filter(a => a.student_id === student.id) || [];
        const presentClasses = studentAttendance.filter(a => a.present).length;
        const totalClasses = studentAttendance.length;
        const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

        return {
          student,
          totalMarks,
          maxMarks,
          percentage,
          attendancePercentage,
          totalClasses,
          presentClasses
        };
      });

      setStudentReports(reports);
    } catch (error: any) {
      console.error('Error loading student reports:', error);
      toast({
        title: "Error",
        description: "Failed to load student reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTeacherEmployeeId = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.employee_id || 'TCH001';
  };

  const exportDetailedReport = async () => {
    try {
      const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'Unknown Subject';
      
      const csvContent = [
        ['Student ID', 'Student Name', 'Total Marks', 'Max Marks', 'Marks %', 'Present Classes', 'Total Classes', 'Attendance %', 'Grade'],
        ...studentReports.map(report => {
          const grade = getGrade(report.percentage);
          return [
            report.student.login_id,
            report.student.name,
            report.totalMarks,
            report.maxMarks,
            report.percentage.toFixed(2) + '%',
            report.presentClasses,
            report.totalClasses,
            report.attendancePercentage.toFixed(2) + '%',
            grade
          ];
        })
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `detailed_report_${subjectName}_${selectedSemester}_${selectedSection}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Detailed report exported successfully",
      });
    } catch (error: any) {
      console.error('Error exporting detailed report:', error);
      toast({
        title: "Error",
        description: "Failed to export detailed report",
        variant: "destructive",
      });
    }
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getUniqueSemesters = () => ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const getUniqueSections = () => ['A', 'B', 'C', 'D'];

  const averageMarks = studentReports.length > 0 ? 
    studentReports.reduce((sum, report) => sum + report.percentage, 0) / studentReports.length : 0;

  const averageAttendance = studentReports.length > 0 ? 
    studentReports.reduce((sum, report) => sum + report.attendancePercentage, 0) / studentReports.length : 0;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <span className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-lg sm:text-xl">Student Reports</span>
            </span>
            <Button 
              onClick={exportDetailedReport} 
              variant="outline" 
              size="sm" 
              disabled={studentReports.length === 0}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {getUniqueSemesters().map(semester => (
                  <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {getUniqueSections().map(section => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {studentReports.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                  <p className="text-lg sm:text-2xl font-bold">{studentReports.length}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Average Marks</p>
                  <p className="text-lg sm:text-2xl font-bold">{averageMarks.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Average Attendance</p>
                  <p className="text-lg sm:text-2xl font-bold">{averageAttendance.toFixed(1)}%</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pass Rate</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {((studentReports.filter(r => r.percentage >= 40).length / studentReports.length) * 100).toFixed(1)}%
                  </p>
                </div>
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Table */}
      {studentReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Detailed Student Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Student ID</TableHead>
                    <TableHead className="text-xs sm:text-sm">Name</TableHead>
                    <TableHead className="text-xs sm:text-sm">Marks</TableHead>
                    <TableHead className="text-xs sm:text-sm">Marks %</TableHead>
                    <TableHead className="text-xs sm:text-sm">Attendance</TableHead>
                    <TableHead className="text-xs sm:text-sm">Attendance %</TableHead>
                    <TableHead className="text-xs sm:text-sm">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentReports.map((report) => {
                    const grade = getGrade(report.percentage);
                    return (
                      <TableRow key={report.student.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{report.student.login_id}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{report.student.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <span className="font-medium">
                            {report.totalMarks} / {report.maxMarks}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${report.percentage >= 40 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs`}
                          >
                            {report.percentage.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <span className="font-medium">
                            {report.presentClasses} / {report.totalClasses}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={`${report.attendancePercentage >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs`}
                          >
                            {report.attendancePercentage.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getGradeColor(grade)} text-xs`}>
                            {grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty States */}
      {!selectedSemester || !selectedSection || !selectedSubject ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Select Filters</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Please select semester, section, and subject to view student reports.
            </p>
          </CardContent>
        </Card>
      ) : studentReports.length === 0 && !loading ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Students Enrolled</h3>
            <p className="text-sm sm:text-base text-gray-600">
              No students are enrolled in this subject for the selected semester and section.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {loading && (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-slate-600">Loading reports...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentReports;
