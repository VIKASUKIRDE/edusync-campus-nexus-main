
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useStudents } from '@/hooks/useStudents';
import { useDepartments } from '@/hooks/useDepartments';
import StudentForm from './StudentForm';
import { ConfirmDialog } from '@/components/ui/alert-dialog-confirm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ManageStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; student: any }>({ open: false, student: null });
  const [emailSending, setEmailSending] = useState<string | null>(null);
  
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { departments } = useDepartments();
  const { toast } = useToast();

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.login_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || student.department_id === selectedDepartment;
    const matchesSemester = selectedSemester === 'all' || student.semester === selectedSemester;
    
    return matchesSearch && matchesDepartment && matchesSemester;
  });

  const sendWelcomeEmail = async (studentData: any, generatedPassword: string) => {
    try {
      console.log('Sending welcome email to:', studentData.email);
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          to: studentData.email,
          name: studentData.name,
          loginId: studentData.login_id,
          password: generatedPassword,
          type: 'student'
        }
      });

      console.log('Welcome email response:', { data, error });

      if (error) {
        console.error('Email error:', error);
        toast({
          title: "Student Added",
          description: `Student added successfully but welcome email failed: ${error.message}. Please check email settings or send manually.`,
          variant: "destructive",
        });
      } else if (data?.success) {
        console.log('Email sent successfully:', data);
        toast({
          title: "Success! 📧",
          description: `Student added and welcome email sent to ${studentData.email} via ${data.method?.toUpperCase()}`,
        });
      } else {
        toast({
          title: "Student Added",
          description: `Student added successfully but welcome email failed: ${data?.error || 'Unknown error'}. Please check email settings.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      toast({
        title: "Student Added",
        description: "Student added successfully but welcome email could not be sent. Please check email settings in admin panel.",
        variant: "destructive",
      });
    }
  };

  const resendWelcomeEmail = async (student: any) => {
    setEmailSending(student.id);
    try {
      console.log('Resending welcome email to:', student.email);
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          to: student.email,
          name: student.name,
          loginId: student.login_id,
          password: 'Please contact admin for your password',
          type: 'student'
        }
      });

      console.log('Resend email response:', { data, error });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast({
          title: "Email Sent! 📧",
          description: `Welcome email resent to ${student.email} via ${data.method?.toUpperCase()}`,
        });
      } else {
        throw new Error(data?.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Resend email error:', error);
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email. Please check email settings in admin panel.",
        variant: "destructive",
      });
    } finally {
      setEmailSending(null);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDeleteClick = (student: any) => {
    setDeleteConfirm({ open: true, student });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.student) {
      const { error } = await deleteStudent(deleteConfirm.student.id);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete student",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Student deleted successfully",
        });
      }
    }
    setDeleteConfirm({ open: false, student: null });
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingStudent) {
        const { error } = await updateStudent(editingStudent.id, data);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        const { data: result, error } = await addStudent(data);
        if (error) throw error;
        
        // Send welcome email if student was added successfully
        if (result?.generatedPassword) {
          await sendWelcomeEmail(result, result.generatedPassword);
        } else {
          toast({
            title: "Success",
            description: "Student added successfully",
          });
        }
      }
      setShowForm(false);
      setEditingStudent(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (showForm) {
    return (
      <StudentForm
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingStudent(null);
        }}
        initialData={editingStudent}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Management</h1>
            <p className="text-primary-100">Add, edit, and manage student records with ease</p>
          </div>
          <Button 
            onClick={handleAddStudent}
            className="bg-white text-primary-600 hover:bg-primary-50 font-semibold"
            size="lg"
          >
            <Plus size={18} className="mr-2" />
            Add New Student
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Filter Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map(sem => (
                  <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="col-span-2 flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDepartment('all');
                  setSelectedSemester('all');
                }}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Badge variant="secondary" className="px-3 py-2 font-medium">
                {filteredStudents.length} Students
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Students Table */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Students Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Student ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Mobile</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Semester</TableHead>
                  <TableHead className="font-semibold">Section</TableHead>
                  <TableHead className="font-semibold">Enrolled</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-primary-600">{student.login_id}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-slate-600">{student.email}</TableCell>
                    <TableCell className="text-slate-600">{student.mobile}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {departments.find(d => d.id === student.department_id)?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.semester}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.section}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(student.enrollment_date || '').toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                          className="hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendWelcomeEmail(student)}
                          disabled={emailSending === student.id}
                          className="hover:bg-green-50 hover:border-green-200"
                        >
                          <Mail size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(student)}
                          className="hover:bg-red-50 hover:border-red-200 text-red-600"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, student: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        description={`Are you sure you want to delete ${deleteConfirm.student?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default ManageStudents;
