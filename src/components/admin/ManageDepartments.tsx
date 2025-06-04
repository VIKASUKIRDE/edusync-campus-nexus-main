
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDepartments } from '@/hooks/useDepartments';
import { useStudents } from '@/hooks/useStudents';
import { useTeachers } from '@/hooks/useTeachers';
import { useCourses } from '@/hooks/useCourses';
import DepartmentForm from './DepartmentForm';
import { ConfirmDialog } from '@/components/ui/alert-dialog-confirm';
import { useToast } from '@/hooks/use-toast';

const ManageDepartments: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; department: any }>({ open: false, department: null });
  
  const { departments, loading, addDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const { students } = useStudents();
  const { teachers } = useTeachers();
  const { courses } = useCourses();
  const { toast } = useToast();

  // Calculate stats for each department
  const departmentStats = departments.map(dept => {
    const deptStudents = students.filter(s => s.department_id === dept.id).length;
    const deptTeachers = teachers.filter(t => t.department_id === dept.id).length;
    const deptCourses = courses.filter(c => c.department_id === dept.id).length;
    
    return {
      ...dept,
      totalStudents: deptStudents,
      totalTeachers: deptTeachers,
      totalCourses: deptCourses
    };
  });

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setShowForm(true);
  };

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleDeleteClick = (department: any) => {
    setDeleteConfirm({ open: true, department });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.department) {
      const { error } = await deleteDepartment(deleteConfirm.department.id);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete department",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Department deleted successfully",
        });
      }
    }
    setDeleteConfirm({ open: false, department: null });
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingDepartment) {
        const { error } = await updateDepartment(editingDepartment.id, data);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Department updated successfully",
        });
      } else {
        const { error } = await addDepartment(data);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Department added successfully",
        });
      }
      setShowForm(false);
      setEditingDepartment(null);
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
      <DepartmentForm
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingDepartment(null);
        }}
        initialData={editingDepartment}
      />
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Departments</h1>
          <p className="text-gray-600">Add, edit, and manage college departments</p>
        </div>
        <Button onClick={handleAddDepartment} className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Add Department</span>
        </Button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentStats.map((dept) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{dept.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDepartment(dept)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(dept)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-600">Department Head</div>
                <div className="text-gray-900">{dept.head_name || 'Not assigned'}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{dept.totalStudents}</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{dept.totalTeachers}</div>
                  <div className="text-xs text-gray-500">Teachers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{dept.totalCourses}</div>
                  <div className="text-xs text-gray-500">Courses</div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-600">
                  Established: <span className="font-medium">{dept.established_year || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Department Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {departmentStats.reduce((sum, dept) => sum + dept.totalStudents, 0)}
              </div>
              <div className="text-sm text-blue-600">Total Students</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {departmentStats.reduce((sum, dept) => sum + dept.totalTeachers, 0)}
              </div>
              <div className="text-sm text-green-600">Total Teachers</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {departmentStats.reduce((sum, dept) => sum + dept.totalCourses, 0)}
              </div>
              <div className="text-sm text-purple-600">Total Courses</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{departments.length}</div>
              <div className="text-sm text-orange-600">Departments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, department: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        description={`Are you sure you want to delete ${deleteConfirm.department?.name}? This action cannot be undone and may affect associated students, teachers, and courses.`}
      />
    </div>
  );
};

export default ManageDepartments;
