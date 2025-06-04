
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Upload, Save, FileSpreadsheet, Users, Download } from 'lucide-react';
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

interface AttendanceRecord {
  id?: string;
  student_id: string;
  teacher_id: string;
  date: string;
  present: boolean;
}

const AttendanceManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('');
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
    getCurrentTeacher();
  }, []);

  useEffect(() => {
    if (selectedDate && currentTeacherId) {
      loadAttendanceForDate();
    }
  }, [selectedDate, selectedSemester, selectedSection, currentTeacherId]);

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
    }
  };

  const loadStudents = async () => {
    try {
      const teacherEmployeeId = getCurrentTeacherEmployeeId();
      
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('department_id')
        .eq('employee_id', teacherEmployeeId)
        .single();

      if (teacherError) throw teacherError;

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, login_id, semester, section')
        .eq('department_id', teacher.department_id)
        .order('name');

      if (studentsError) throw studentsError;

      setStudents(studentsData || []);
    } catch (error: any) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    }
  };

  const getCurrentTeacherEmployeeId = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.employee_id || 'TCH001';
  };

  const loadAttendanceForDate = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select('student_id, present')
        .eq('teacher_id', currentTeacherId)
        .eq('date', dateStr);

      if (error) throw error;

      const records: Record<string, boolean> = {};
      
      getFilteredStudents().forEach(student => {
        records[student.id] = false;
      });

      attendanceData?.forEach(record => {
        records[record.student_id] = record.present;
      });

      setAttendanceRecords(records);
    } catch (error: any) {
      console.error('Error loading attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    }
  };

  const getFilteredStudents = () => {
    let filtered = students;

    if (selectedSemester !== 'all') {
      filtered = filtered.filter(s => s.semester === selectedSemester);
    }

    if (selectedSection !== 'all') {
      filtered = filtered.filter(s => s.section === selectedSection);
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: present
    }));
  };

  const markAllPresent = () => {
    const records: Record<string, boolean> = {};
    filteredStudents.forEach(student => {
      records[student.id] = true;
    });
    setAttendanceRecords(prev => ({ ...prev, ...records }));
  };

  const markAllAbsent = () => {
    const records: Record<string, boolean> = {};
    filteredStudents.forEach(student => {
      records[student.id] = false;
    });
    setAttendanceRecords(prev => ({ ...prev, ...records }));
  };

  const saveAttendance = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      const attendanceToSave = filteredStudents.map(student => ({
        student_id: student.id,
        teacher_id: currentTeacherId,
        date: dateStr,
        present: attendanceRecords[student.id] || false
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceToSave, {
          onConflict: 'student_id,date'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAttendanceReport = async () => {
    try {
      if (!dateRange.startDate || !dateRange.endDate) {
        toast({
          title: "Error",
          description: "Please select both start and end dates",
          variant: "destructive",
        });
        return;
      }

      const startDate = format(dateRange.startDate, 'yyyy-MM-dd');
      const endDate = format(dateRange.endDate, 'yyyy-MM-dd');

      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`
          date,
          present,
          students!inner(login_id, name, semester, section)
        `)
        .eq('teacher_id', currentTeacherId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      if (error) throw error;

      // Group attendance by student
      const studentAttendance: Record<string, any> = {};
      attendanceData?.forEach(record => {
        const studentId = record.students.login_id;
        if (!studentAttendance[studentId]) {
          studentAttendance[studentId] = {
            name: record.students.name,
            login_id: record.students.login_id,
            semester: record.students.semester,
            section: record.students.section,
            attendance: []
          };
        }
        studentAttendance[studentId].attendance.push({
          date: record.date,
          present: record.present
        });
      });

      // Create CSV content
      const dates = Array.from(new Set(attendanceData?.map(r => r.date) || [])).sort();
      const csvHeaders = ['Student ID', 'Student Name', 'Semester', 'Section', ...dates, 'Total Present', 'Total Absent', 'Attendance %'];
      
      const csvRows = Object.values(studentAttendance).map((student: any) => {
        const attendanceByDate: Record<string, boolean> = {};
        student.attendance.forEach((att: any) => {
          attendanceByDate[att.date] = att.present;
        });

        const attendanceValues = dates.map(date => attendanceByDate[date] ? 'P' : 'A');
        const totalPresent = student.attendance.filter((att: any) => att.present).length;
        const totalAbsent = student.attendance.length - totalPresent;
        const attendancePercentage = student.attendance.length > 0 ? 
          ((totalPresent / student.attendance.length) * 100).toFixed(2) + '%' : '0%';

        return [
          student.login_id,
          student.name,
          student.semester,
          student.section,
          ...attendanceValues,
          totalPresent,
          totalAbsent,
          attendancePercentage
        ];
      });

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_report_${startDate}_to_${endDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setExportDialogOpen(false);
      toast({
        title: "Success",
        description: "Attendance report exported successfully",
      });
    } catch (error: any) {
      console.error('Error exporting attendance report:', error);
      toast({
        title: "Error",
        description: "Failed to export attendance report",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpload = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const records: Record<string, boolean> = {};

      lines.slice(1).forEach(line => {
        const [studentId, status] = line.split(',');
        if (studentId && status) {
          records[studentId.trim()] = status.trim().toLowerCase() === 'present';
        }
      });

      setAttendanceRecords(prev => ({ ...prev, ...records }));
      
      toast({
        title: "Success",
        description: "Bulk attendance uploaded successfully",
      });
      setBulkUploadOpen(false);
    } catch (error: any) {
      console.error('Error uploading bulk attendance:', error);
      toast({
        title: "Error",
        description: "Failed to upload bulk attendance",
        variant: "destructive",
      });
    }
  };

  const getUniqueSemesters = () => {
    const semesters = [...new Set(students.map(s => s.semester))];
    return semesters.sort();
  };

  const getUniqueSections = () => {
    const sections = [...new Set(students.map(s => s.section))];
    return sections.sort();
  };

  const presentCount = Object.values(attendanceRecords).filter(Boolean).length;
  const absentCount = filteredStudents.length - presentCount;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Mark Attendance</span>
            </span>
            <div className="flex space-x-2">
              <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Attendance Report</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(dateRange.startDate, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.startDate}
                            onSelect={(date) => date && setDateRange(prev => ({ ...prev, startDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(dateRange.endDate, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.endDate}
                            onSelect={(date) => date && setDateRange(prev => ({ ...prev, endDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={exportAttendanceReport}>
                        Export Report
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Bulk Upload
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Upload Attendance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBulkUpload(file);
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Upload a CSV file with columns: student_id, status (Present/Absent)
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={saveAttendance} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Attendance
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
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
                <SelectItem value="all">All Sections</SelectItem>
                {getUniqueSections().map(section => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={markAllPresent}>
                All Present
              </Button>
              <Button variant="outline" size="sm" onClick={markAllAbsent}>
                All Absent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">✗</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance - {format(selectedDate, "PPP")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-semibold">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.login_id}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">{student.semester}</Badge>
                    <Badge variant="outline">{student.section}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`present-${student.id}`}
                      checked={attendanceRecords[student.id] === true}
                      onCheckedChange={(checked) => handleAttendanceChange(student.id, !!checked)}
                    />
                    <label htmlFor={`present-${student.id}`} className="text-sm font-medium">
                      Present
                    </label>
                  </div>
                  <Badge 
                    variant={attendanceRecords[student.id] ? "default" : "destructive"}
                    className={attendanceRecords[student.id] ? "bg-green-100 text-green-800" : ""}
                  >
                    {attendanceRecords[student.id] ? "Present" : "Absent"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;
