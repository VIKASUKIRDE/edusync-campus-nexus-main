import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, Save, Settings, Download, Plus, History, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  login_id: string;
  semester: string;
  section: string;
  email: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface MarksConfig {
  id: string;
  max_internal_marks: number;
  max_practical_marks: number;
  max_assignment_marks: number;
  max_total_marks: number;
}

interface StudentMark {
  id?: string;
  student_id: string;
  internal_marks: number;
  practical_marks: number;
  assignment_marks: number;
  total_marks?: number;
}

interface MarksHistory {
  id: string;
  previous_internal_marks: number;
  previous_practical_marks: number;
  previous_assignment_marks: number;
  new_internal_marks: number;
  new_practical_marks: number;
  new_assignment_marks: number;
  changed_at: string;
  reason: string;
  student_name?: string;
}

const MarksManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marksConfig, setMarksConfig] = useState<MarksConfig | null>(null);
  const [studentMarks, setStudentMarks] = useState<Record<string, StudentMark>>({});
  const [marksHistory, setMarksHistory] = useState<MarksHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    max_internal_marks: 50,
    max_practical_marks: 25,
    max_assignment_marks: 25
  });
  const { toast } = useToast();

  // Predefined options
  const semesterOptions = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const sectionOptions = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedSemester && selectedSection && selectedSubject && currentTeacherId) {
      loadMarksConfiguration();
      loadStudents();
      loadStudentMarks();
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
        .select('id, name, code')
        .eq('teacher_id', teacherId)
        .order('name');

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

  const loadStudents = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const employeeId = currentUser.employee_id || 'TCH001';
      
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('department_id')
        .eq('employee_id', employeeId)
        .single();

      if (teacherError) throw teacherError;

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, login_id, semester, section, email')
        .eq('department_id', teacher.department_id)
        .eq('semester', selectedSemester)
        .eq('section', selectedSection)
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

  const loadMarksConfiguration = async () => {
    try {
      const { data: configData, error } = await supabase
        .from('marks_configuration')
        .select('*')
        .eq('teacher_id', currentTeacherId)
        .eq('subject_id', selectedSubject)
        .eq('semester', selectedSemester)
        .eq('section', selectedSection)
        .maybeSingle();

      if (error) throw error;

      if (configData) {
        setMarksConfig(configData);
        setTempConfig({
          max_internal_marks: configData.max_internal_marks,
          max_practical_marks: configData.max_practical_marks,
          max_assignment_marks: configData.max_assignment_marks
        });
      } else {
        setMarksConfig(null);
        setTempConfig({
          max_internal_marks: 50,
          max_practical_marks: 25,
          max_assignment_marks: 25
        });
      }
    } catch (error: any) {
      console.error('Error loading marks configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load marks configuration",
        variant: "destructive",
      });
    }
  };

  const loadStudentMarks = async () => {
    try {
      const { data: marksData, error } = await supabase
        .from('student_marks')
        .select('*')
        .eq('teacher_id', currentTeacherId)
        .eq('subject_id', selectedSubject)
        .eq('semester', selectedSemester)
        .eq('section', selectedSection);

      if (error) throw error;

      const marksMap: Record<string, StudentMark> = {};
      marksData?.forEach(mark => {
        marksMap[mark.student_id] = {
          id: mark.id,
          student_id: mark.student_id,
          internal_marks: mark.internal_marks || 0,
          practical_marks: mark.practical_marks || 0,
          assignment_marks: mark.assignment_marks || 0,
          total_marks: mark.total_marks || 0
        };
      });

      setStudentMarks(marksMap);
    } catch (error: any) {
      console.error('Error loading student marks:', error);
      toast({
        title: "Error",
        description: "Failed to load student marks",
        variant: "destructive",
      });
    }
  };

  const loadMarksHistory = async () => {
    try {
      // First get the marks history data
      const { data: historyData, error: historyError } = await supabase
        .from('marks_history')
        .select(`
          *,
          student_marks!inner(student_id)
        `)
        .eq('student_marks.teacher_id', currentTeacherId)
        .eq('student_marks.subject_id', selectedSubject)
        .eq('student_marks.semester', selectedSemester)
        .eq('student_marks.section', selectedSection)
        .order('changed_at', { ascending: false })
        .limit(50);

      if (historyError) throw historyError;

      // Get student names separately
      if (historyData && historyData.length > 0) {
        const studentIds = [...new Set(historyData.map(item => item.student_marks?.student_id).filter(Boolean))];
        
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, name')
          .in('id', studentIds);

        if (studentsError) throw studentsError;

        const studentNamesMap = new Map(studentsData?.map(student => [student.id, student.name]) || []);

        const formattedHistory: MarksHistory[] = historyData.map(item => ({
          id: item.id,
          previous_internal_marks: item.previous_internal_marks,
          previous_practical_marks: item.previous_practical_marks,
          previous_assignment_marks: item.previous_assignment_marks,
          new_internal_marks: item.new_internal_marks,
          new_practical_marks: item.new_practical_marks,
          new_assignment_marks: item.new_assignment_marks,
          changed_at: item.changed_at,
          reason: item.reason,
          student_name: studentNamesMap.get(item.student_marks?.student_id) || 'Unknown'
        }));

        setMarksHistory(formattedHistory);
      } else {
        setMarksHistory([]);
      }
    } catch (error: any) {
      console.error('Error loading marks history:', error);
      toast({
        title: "Error",
        description: "Failed to load marks history",
        variant: "destructive",
      });
    }
  };

  const saveMarksConfiguration = async () => {
    try {
      setLoading(true);

      const configData = {
        teacher_id: currentTeacherId,
        subject_id: selectedSubject,
        semester: selectedSemester,
        section: selectedSection,
        max_internal_marks: tempConfig.max_internal_marks,
        max_practical_marks: tempConfig.max_practical_marks,
        max_assignment_marks: tempConfig.max_assignment_marks
      };

      const { error } = await supabase
        .from('marks_configuration')
        .upsert([configData], {
          onConflict: 'teacher_id,subject_id,semester,section'
        });

      if (error) throw error;

      await loadMarksConfiguration();
      setConfigDialogOpen(false);

      toast({
        title: "Success",
        description: "Marks configuration saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving marks configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save marks configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, markType: 'internal_marks' | 'practical_marks' | 'assignment_marks', value: string) => {
    const numValue = parseInt(value) || 0;
    
    // Validate against configuration
    if (marksConfig) {
      let maxValue = 0;
      switch (markType) {
        case 'internal_marks':
          maxValue = marksConfig.max_internal_marks;
          break;
        case 'practical_marks':
          maxValue = marksConfig.max_practical_marks;
          break;
        case 'assignment_marks':
          maxValue = marksConfig.max_assignment_marks;
          break;
      }
      
      if (numValue > maxValue) {
        toast({
          title: "Invalid Marks",
          description: `${markType.replace('_', ' ')} cannot exceed ${maxValue}`,
          variant: "destructive",
        });
        return;
      }
    }

    setStudentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        internal_marks: prev[studentId]?.internal_marks || 0,
        practical_marks: prev[studentId]?.practical_marks || 0,
        assignment_marks: prev[studentId]?.assignment_marks || 0,
        [markType]: numValue
      }
    }));
  };

  const saveAllMarks = async () => {
    try {
      setLoading(true);

      const marksToSave = Object.values(studentMarks).map(mark => ({
        student_id: mark.student_id,
        teacher_id: currentTeacherId,
        subject_id: selectedSubject,
        semester: selectedSemester,
        section: selectedSection,
        internal_marks: mark.internal_marks,
        practical_marks: mark.practical_marks,
        assignment_marks: mark.assignment_marks
      }));

      const { error } = await supabase
        .from('student_marks')
        .upsert(marksToSave, {
          onConflict: 'student_id,teacher_id,subject_id,semester,section'
        });

      if (error) throw error;

      await loadStudentMarks();

      toast({
        title: "Success",
        description: "All marks saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving marks:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save marks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportMarksReport = async () => {
    try {
      const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'Unknown Subject';
      
      const csvContent = [
        ['Student ID', 'Student Name', 'Internal Marks', 'Practical Marks', 'Assignment Marks', 'Total Marks', 'Max Total'],
        ...students.map(student => {
          const marks = studentMarks[student.id];
          const totalMarks = marks ? marks.internal_marks + marks.practical_marks + marks.assignment_marks : 0;
          const maxTotal = marksConfig ? marksConfig.max_total_marks : 100;
          
          return [
            student.login_id,
            student.name,
            marks?.internal_marks || 0,
            marks?.practical_marks || 0,
            marks?.assignment_marks || 0,
            totalMarks,
            maxTotal
          ];
        })
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marks_report_${subjectName}_${selectedSemester}_${selectedSection}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Marks report exported successfully",
      });
    } catch (error: any) {
      console.error('Error exporting marks report:', error);
      toast({
        title: "Error",
        description: "Failed to export marks report",
        variant: "destructive",
      });
    }
  };

  const getTotalMarks = (studentId: string) => {
    const marks = studentMarks[studentId];
    if (!marks) return 0;
    return marks.internal_marks + marks.practical_marks + marks.assignment_marks;
  };

  const getMaxTotalMarks = () => {
    if (!marksConfig) return 100;
    return marksConfig.max_total_marks;
  };

  const isConfigured = marksConfig !== null;
  const canManageMarks = selectedSemester && selectedSection && selectedSubject && isConfigured;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5" />
              <span>Marks Management</span>
            </span>
            <div className="flex space-x-2">
              <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!selectedSubject || !selectedSemester || !selectedSection}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Marks
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configure Maximum Marks</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="internal">Maximum Internal Marks</Label>
                      <Input
                        id="internal"
                        type="number"
                        min="0"
                        max="100"
                        value={tempConfig.max_internal_marks}
                        onChange={(e) => setTempConfig(prev => ({ ...prev, max_internal_marks: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="practical">Maximum Practical Marks</Label>
                      <Input
                        id="practical"
                        type="number"
                        min="0"
                        max="100"
                        value={tempConfig.max_practical_marks}
                        onChange={(e) => setTempConfig(prev => ({ ...prev, max_practical_marks: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="assignment">Maximum Assignment Marks</Label>
                      <Input
                        id="assignment"
                        type="number"
                        min="0"
                        max="100"
                        value={tempConfig.max_assignment_marks}
                        onChange={(e) => setTempConfig(prev => ({ ...prev, max_assignment_marks: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Total Maximum Marks: {tempConfig.max_internal_marks + tempConfig.max_practical_marks + tempConfig.max_assignment_marks}
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveMarksConfiguration} disabled={loading}>
                        Save Configuration
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!canManageMarks} onClick={loadMarksHistory}>
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Marks Change History</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {marksHistory.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Changed At</TableHead>
                            <TableHead>Previous Marks</TableHead>
                            <TableHead>New Marks</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {marksHistory.map((history) => (
                            <TableRow key={history.id}>
                              <TableCell>{history.student_name}</TableCell>
                              <TableCell>{format(new Date(history.changed_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                              <TableCell>
                                I:{history.previous_internal_marks} P:{history.previous_practical_marks} A:{history.previous_assignment_marks}
                              </TableCell>
                              <TableCell>
                                I:{history.new_internal_marks} P:{history.new_practical_marks} A:{history.new_assignment_marks}
                              </TableCell>
                              <TableCell>{history.reason}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-gray-500">No history available</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={exportMarksReport} variant="outline" size="sm" disabled={!canManageMarks || students.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={saveAllMarks} disabled={loading || !canManageMarks || students.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Save All Marks
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesterOptions.map(semester => (
                  <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map(section => (
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
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Warning */}
      {selectedSemester && selectedSection && selectedSubject && !isConfigured && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center space-x-3 p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-orange-800 font-medium">Configuration Required</p>
              <p className="text-orange-600 text-sm">Please configure maximum marks before entering student marks.</p>
            </div>
            <Button 
              size="sm" 
              onClick={() => setConfigDialogOpen(true)}
              className="ml-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Configure Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Marks Configuration Display */}
      {marksConfig && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Internal (Max)</p>
                <p className="text-lg font-bold text-blue-600">{marksConfig.max_internal_marks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Practical (Max)</p>
                <p className="text-lg font-bold text-green-600">{marksConfig.max_practical_marks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Assignment (Max)</p>
                <p className="text-lg font-bold text-purple-600">{marksConfig.max_assignment_marks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total (Max)</p>
                <p className="text-lg font-bold text-gray-800">{getMaxTotalMarks()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Marks Table */}
      {canManageMarks && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Marks</span>
              <Badge variant="secondary" className="px-3 py-2 font-medium">
                {students.length} Students
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
                    <TableHead>Internal Marks</TableHead>
                    <TableHead>Practical Marks</TableHead>
                    <TableHead>Assignment Marks</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const totalMarks = getTotalMarks(student.id);
                    const maxTotal = getMaxTotalMarks();
                    const percentage = maxTotal > 0 ? ((totalMarks / maxTotal) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.login_id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={marksConfig?.max_internal_marks || 100}
                            value={studentMarks[student.id]?.internal_marks || 0}
                            onChange={(e) => handleMarkChange(student.id, 'internal_marks', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={marksConfig?.max_practical_marks || 100}
                            value={studentMarks[student.id]?.practical_marks || 0}
                            onChange={(e) => handleMarkChange(student.id, 'practical_marks', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={marksConfig?.max_assignment_marks || 100}
                            value={studentMarks[student.id]?.assignment_marks || 0}
                            onChange={(e) => handleMarkChange(student.id, 'assignment_marks', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-bold">
                            {totalMarks} / {maxTotal}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={parseFloat(percentage) >= 60 ? "default" : "destructive"}
                            className="font-bold"
                          >
                            {percentage}%
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
          <CardContent className="p-12 text-center">
            <FileSpreadsheet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Filters</h3>
            <p className="text-gray-600">
              Please select semester, section, and subject to manage marks.
            </p>
          </CardContent>
        </Card>
      ) : canManageMarks && students.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileSpreadsheet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              No students found for the selected semester and section.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default MarksManagement;
