
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Download,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  login_id: string;
  email: string;
  semester: string;
  section: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface StudentPerformance {
  student: Student;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  latestSubmission: string | null;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

const StudentReports: React.FC = () => {
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedSemester && selectedSection) {
      loadStudentReports();
    } else {
      setStudents([]);
    }
  }, [selectedSubject, selectedSemester, selectedSection]);

  const getCurrentTeacherId = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('employee_id', currentUser.employee_id || 'TCH001')
      .single();
    return teacher?.id;
  };

  const loadSubjects = async () => {
    try {
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) return;

      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('teacher_id', teacherId);

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
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
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) return;

      // First, get students who are enrolled in the selected subject
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
        // If there's no enrollment table or data, fallback to all students with matching semester/section
        const { data: allStudents, error: studentError } = await supabase
          .from('students')
          .select('id, name, login_id, email, semester, section')
          .eq('semester', selectedSemester)
          .eq('section', selectedSection);

        if (studentError) throw studentError;
        
        if (!allStudents || allStudents.length === 0) {
          setStudents([]);
          return;
        }

        await processStudentPerformance(allStudents, teacherId);
        return;
      }

      if (!enrolledStudents || enrolledStudents.length === 0) {
        setStudents([]);
        return;
      }

      // Extract student data from the enrollment query
      const studentData = enrolledStudents
        .map(enrollment => enrollment.students)
        .filter(student => student && student.semester === selectedSemester && student.section === selectedSection);

      if (studentData.length === 0) {
        setStudents([]);
        return;
      }

      await processStudentPerformance(studentData, teacherId);

    } catch (error) {
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

  const processStudentPerformance = async (studentData: any[], teacherId: string) => {
    // Get assignments for the selected subject, semester, and section
    const { data: assignments, error: assignmentError } = await supabase
      .from('assignments')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('subject_id', selectedSubject)
      .eq('semester', selectedSemester)
      .eq('section', selectedSection)
      .eq('status', 'published');

    if (assignmentError) {
      console.error('Error loading assignments:', assignmentError);
      return;
    }

    const assignmentIds = assignments?.map(a => a.id) || [];
    
    // Process each student's performance
    const studentPerformance: StudentPerformance[] = await Promise.all(
      studentData.map(async (student) => {
        let totalAssignments = assignmentIds.length;
        let completedAssignments = 0;
        let totalScore = 0;
        let submissionCount = 0;
        let latestSubmission: string | null = null;

        if (assignmentIds.length > 0) {
          // Get student's submissions for these assignments
          const { data: submissions } = await supabase
            .from('student_submissions')
            .select('total_score, submitted_at')
            .eq('student_id', student.id)
            .in('assignment_id', assignmentIds)
            .order('submitted_at', { ascending: false });

          if (submissions) {
            completedAssignments = submissions.length;
            submissionCount = submissions.length;
            
            if (submissions.length > 0) {
              latestSubmission = submissions[0].submitted_at;
              totalScore = submissions.reduce((sum, sub) => sum + (sub.total_score || 0), 0);
            }
          }
        }

        const averageScore = submissionCount > 0 ? Math.round(totalScore / submissionCount) : 0;
        
        // Determine performance status
        let status: 'excellent' | 'good' | 'average' | 'poor' = 'poor';
        if (averageScore >= 90) status = 'excellent';
        else if (averageScore >= 75) status = 'good';
        else if (averageScore >= 60) status = 'average';

        return {
          student,
          totalAssignments,
          completedAssignments,
          averageScore,
          latestSubmission,
          status
        };
      })
    );

    setStudents(studentPerformance);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'average':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'average':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const filteredStudents = students.filter(item =>
    item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.student.login_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportReports = () => {
    const csvContent = [
      ['Student Name', 'Login ID', 'Total Assignments', 'Completed', 'Average Score', 'Status'],
      ...filteredStudents.map(item => [
        item.student.name,
        item.student.login_id,
        item.totalAssignments.toString(),
        item.completedAssignments.toString(),
        item.averageScore.toString(),
        item.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-reports-${selectedSubject}-${selectedSemester}-${selectedSection}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Student Reports</h2>
            <p className="text-gray-600">Track individual student performance</p>
          </div>
        </div>
        <Button onClick={exportReports} disabled={filteredStudents.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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
              <Label>Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Semester</SelectItem>
                  <SelectItem value="2nd">2nd Semester</SelectItem>
                  <SelectItem value="3rd">3rd Semester</SelectItem>
                  <SelectItem value="4th">4th Semester</SelectItem>
                  <SelectItem value="5th">5th Semester</SelectItem>
                  <SelectItem value="6th">6th Semester</SelectItem>
                  <SelectItem value="7th">7th Semester</SelectItem>
                  <SelectItem value="8th">8th Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="D">Section D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search Students</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or login ID"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading student reports...</p>
        </div>
      ) : !selectedSubject || !selectedSemester || !selectedSection ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Filters</h3>
            <p className="text-gray-600">Please select subject, semester, and section to view student reports</p>
          </CardContent>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              No students are enrolled in the selected subject for {selectedSemester} - Section {selectedSection}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((item) => (
            <Card key={item.student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.student.name}</h3>
                      <p className="text-gray-600">{item.student.login_id} • {item.student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(item.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{item.totalAssignments}</div>
                    <div className="text-sm text-gray-600">Total Assignments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{item.completedAssignments}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{item.averageScore}%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((item.completedAssignments / Math.max(item.totalAssignments, 1)) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                </div>

                {item.latestSubmission && (
                  <div className="mt-4 text-sm text-gray-600">
                    Last submission: {new Date(item.latestSubmission).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentReports;
