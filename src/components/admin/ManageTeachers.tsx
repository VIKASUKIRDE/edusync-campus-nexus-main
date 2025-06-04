
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useTeachers } from '@/hooks/useTeachers';
import { useDepartments } from '@/hooks/useDepartments';
import TeacherForm from './TeacherForm';
import { ConfirmDialog } from '@/components/ui/alert-dialog-confirm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ManageTeachers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; teacher: any }>({ open: false, teacher: null });
  const [emailSending, setEmailSending] = useState<string | null>(null);
  
  const { teachers, loading, addTeacher, updateTeacher, deleteTeacher } = useTeachers();
  const { departments } = useDepartments();
  const { toast } = useToast();

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || teacher.department_id === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const sendWelcomeEmail = async (teacherData: any, generatedPassword: string) => {
    try {
      console.log('Sending welcome email to:', teacherData.email);
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          to: teacherData.email,
          name: teacherData.name,
          loginId: teacherData.employee_id,
          password: generatedPassword,
          type: 'teacher'
        }
      });

      if (error) {
        console.error('Email error:', error);
        toast({
          title: "Teacher Added",
          description: "Teacher added successfully but welcome email could not be sent. Please check email settings.",
          variant: "destructive",
        });
      } else {
        console.log('Email sent successfully:', data);
        toast({
          title: "Success! 📧",
          description: `Teacher added and welcome email sent to ${teacherData.email}`,
        });
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      toast({
        title: "Teacher Added",
        description: "Teacher added successfully but welcome email could not be sent. Please check email settings.",
        variant: "destructive",
      });
    }
  };

  const resendWelcomeEmail = async (teacher: any) => {
    setEmailSending(teacher.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          to: teacher.email,
          name: teacher.name,
          loginId: teacher.employee_id,
          password: 'Please contact admin for your password',
          type: 'teacher'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email Sent! 📧",
        description: `Welcome email resent to ${teacher.email}`,
      });
    } catch (error: any) {
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setEmailSending(null);
    }
  };

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  const handleEditTeacher = (teacher: any) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleDeleteClick = (teacher: any) => {
    setDeleteConfirm({ open: true, teacher });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.teacher) {
      const { error } = await deleteTeacher(deleteConfirm.teacher.id);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete teacher",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Teacher deleted successfully",
        });
      }
    }
    setDeleteConfirm({ open: false, teacher: null });
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingTeacher) {
        const { error } = await updateTeacher(editingTeacher.id, data);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      } else {
        const { data: result, error } = await addTeacher(data);
        if (error) throw error;
        
        // Send welcome email if teacher was added successfully
        if (result?.generatedPassword) {
          await sendWelcomeEmail(result, result.generatedPassword);
        } else {
          toast({
            title: "Success",
            description: "Teacher added successfully",
          });
        }
      }
      setShowForm(false);
      setEditingTeacher(null);
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
      <TeacherForm
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingTeacher(null);
        }}
        initialData={editingTeacher}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading teachers...</p>
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
            <h1 className="text-3xl font-bold mb-2">Teacher Management</h1>
            <p className="text-primary-100">Add, edit, and manage faculty records with ease</p>
          </div>
          <Button 
            onClick={handleAddTeacher}
            className="bg-white text-primary-600 hover:bg-primary-50 font-semibold"
            size="lg"
          >
            <Plus size={18} className="mr-2" />
            Add New Teacher
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Filter Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="col-span-2 flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDepartment('all');
                }}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Badge variant="secondary" className="px-3 py-2 font-medium">
                {filteredTeachers.length} Teachers
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Teachers Table */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Teachers Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Employee ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Mobile</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Subjects</TableHead>
                  <TableHead className="font-semibold">Experience</TableHead>
                  <TableHead className="font-semibold">Qualification</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-primary-600">{teacher.employee_id}</TableCell>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell className="text-slate-600">{teacher.email}</TableCell>
                    <TableCell className="text-slate-600">{teacher.mobile}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {departments.find(d => d.id === teacher.department_id)?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="max-w-xs truncate">
                        {teacher.subjects?.join(', ') || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{teacher.experience || 'N/A'}</TableCell>
                    <TableCell className="text-slate-600">{teacher.qualification || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTeacher(teacher)}
                          className="hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendWelcomeEmail(teacher)}
                          disabled={emailSending === teacher.id}
                          className="hover:bg-green-50 hover:border-green-200"
                        >
                          <Mail size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(teacher)}
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
        onOpenChange={(open) => setDeleteConfirm({ open, teacher: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${deleteConfirm.teacher?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default ManageTeachers;
