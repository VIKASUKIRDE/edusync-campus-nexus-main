import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  login_id: string;
  email: string;
  mobile: string;
  semester: string;
  section: string;
  profile_picture_url: string | null;
  enrollment_date: string;
  departments: {
    name: string;
  } | null;
}

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedSemester, selectedSection]);

  const getCurrentTeacherEmployeeId = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.employee_id || 'TCH001';
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const teacherEmployeeId = getCurrentTeacherEmployeeId();
      
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('department_id')
        .eq('employee_id', teacherEmployeeId)
        .single();

      if (teacherError) {
        console.error('Teacher error:', teacherError);
        return;
      }

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          departments(name)
        `)
        .eq('department_id', teacher.department_id)
        .order('name');

      if (studentsError) {
        console.error('Students error:', studentsError);
        throw studentsError;
      }

      // Log the data to see what we're working with
      console.log('Loaded students data:', studentsData);
      
      setStudents(studentsData || []);
    } catch (error: any) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.login_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSemester) {
      filtered = filtered.filter(student => student.semester === selectedSemester);
    }

    if (selectedSection) {
      filtered = filtered.filter(student => student.section === selectedSection);
    }

    setFilteredStudents(filtered);
  };

  const getUniqueSemesters = () => {
    const semesters = [...new Set(students.map(s => s.semester))]
      .filter(semester => {
        const isValid = semester && semester.trim() !== '';
        console.log('Semester value:', semester, 'isValid:', isValid);
        return isValid;
      });
    console.log('Final semesters:', semesters);
    return semesters.sort();
  };

  const getUniqueSections = () => {
    const sections = [...new Set(students.map(s => s.section))]
      .filter(section => {
        const isValid = section && section.trim() !== '';
        console.log('Section value:', section, 'isValid:', isValid);
        return isValid;
      });
    console.log('Final sections:', sections);
    return sections.sort();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Students</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedSemester('');
              setSelectedSection('');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Students List</span>
            </span>
            <Badge variant="secondary" className="px-3 py-2 font-medium">
              {filteredStudents.length} Students
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-blue-600">{student.login_id}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.mobile}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {student.departments?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.semester}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.section}</Badge>
                    </TableCell>
                    <TableCell>{new Date(student.enrollment_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredStudents.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              No students match your current filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentList;
