
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, UserPlus, Download, Users } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  login_id: string;
  email: string;
  section: string;
  semester: string;
  enrolled?: boolean;
}

interface StudentEnrollmentManagerProps {
  subjectId: string;
  subjectName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const StudentEnrollmentManager: React.FC<StudentEnrollmentManagerProps> = ({
  subjectId,
  subjectName,
  open,
  onClose,
  onSuccess
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadStudents();
      loadEnrolledStudents();
    }
  }, [open, subjectId]);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, login_id, email, section, semester')
        .order('name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    }
  };

  const loadEnrolledStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('subject_enrollments')
        .select(`
          student_id,
          students (
            id, name, login_id, email, section, semester
          )
        `)
        .eq('subject_id', subjectId)
        .eq('status', 'active');

      if (error) throw error;
      
      const enrolled = (data || [])
        .filter(enrollment => enrollment.students)
        .map(enrollment => enrollment.students as Student);
      
      setEnrolledStudents(enrolled);
    } catch (error: any) {
      console.error('Error loading enrolled students:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.login_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
    const matchesSemester = semesterFilter === 'all' || student.semester === semesterFilter;
    
    // Check if student is already enrolled
    const isEnrolled = enrolledStudents.some(enrolled => enrolled.id === student.id);
    
    return matchesSearch && matchesSection && matchesSemester && !isEnrolled;
  });

  const sections = [...new Set(students.map(s => s.section))];
  const semesters = [...new Set(students.map(s => s.semester))];

  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student to enroll",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const enrollments = selectedStudents.map(studentId => ({
        subject_id: subjectId,
        student_id: studentId,
        status: 'active'
      }));

      const { error } = await supabase
        .from('subject_enrollments')
        .insert(enrollments);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedStudents.length} students enrolled successfully`,
      });

      setSelectedStudents([]);
      loadEnrolledStudents();
      onSuccess();
    } catch (error: any) {
      console.error('Error enrolling students:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enroll students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnenrollStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('subject_enrollments')
        .delete()
        .eq('subject_id', subjectId)
        .eq('student_id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student unenrolled successfully",
      });

      loadEnrolledStudents();
      onSuccess();
    } catch (error: any) {
      console.error('Error unenrolling student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unenroll student",
        variant: "destructive",
      });
    }
  };

  const exportEnrolledStudents = () => {
    const csvContent = [
      ['Name', 'Login ID', 'Email', 'Section', 'Semester', 'Enrollment Date'],
      ...enrolledStudents.map(student => [
        student.name,
        student.login_id,
        student.email,
        student.section,
        student.semester,
        new Date().toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subjectName}_enrolled_students.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllFilteredStudents = () => {
    const allFilteredIds = filteredStudents.map(s => s.id);
    setSelectedStudents(allFilteredIds);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-900">
            Student Enrollment - {subjectName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Enrolled Students Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Enrolled Students ({enrolledStudents.length})
              </h3>
              <Button
                onClick={exportEnrolledStudents}
                variant="outline"
                size="sm"
                disabled={enrolledStudents.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
              {enrolledStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">{student.name}</p>
                    <p className="text-sm text-green-700">{student.login_id}</p>
                    <Badge variant="secondary" className="text-xs">
                      {student.section} - {student.semester}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUnenrollStudent(student.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Students Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-800">Available Students</h3>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Students</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="search"
                    placeholder="Search by name, ID, or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections.map(section => (
                      <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesters.map(semester => (
                      <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={selectAllFilteredStudents}
                  variant="outline"
                  className="w-full"
                >
                  Select All ({filteredStudents.length})
                </Button>
              </div>
            </div>

            {/* Students List */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No available students found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
                  {filteredStudents.map(student => (
                    <div key={student.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudentSelection(student.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.login_id} - {student.email}</p>
                        <Badge variant="outline" className="text-xs">
                          {student.section} - {student.semester}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedStudents.length} students selected
          </div>
          <div className="space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={handleEnrollStudents}
              disabled={loading || selectedStudents.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Enrolling...' : `Enroll ${selectedStudents.length} Students`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentEnrollmentManager;
