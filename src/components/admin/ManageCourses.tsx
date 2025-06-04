
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourses } from '@/hooks/useCourses';
import { useDepartments } from '@/hooks/useDepartments';
import CourseForm from './CourseForm';
import { ConfirmDialog } from '@/components/ui/alert-dialog-confirm';
import { useToast } from '@/hooks/use-toast';

const ManageCourses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; course: any }>({ open: false, course: null });
  
  const { courses, loading, addCourse, updateCourse, deleteCourse } = useCourses();
  const { departments } = useDepartments();
  const { toast } = useToast();

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || course.department_id === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDeleteClick = (course: any) => {
    setDeleteConfirm({ open: true, course });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.course) {
      const { error } = await deleteCourse(deleteConfirm.course.id);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Course deleted successfully",
        });
      }
    }
    setDeleteConfirm({ open: false, course: null });
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCourse) {
        const { error } = await updateCourse(editingCourse.id, data);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        const { error } = await addCourse(data);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Course added successfully",
        });
      }
      setShowForm(false);
      setEditingCourse(null);
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
      <CourseForm
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingCourse(null);
        }}
        initialData={editingCourse}
      />
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-600">Add, edit, and manage course curriculum</p>
        </div>
        <Button onClick={handleAddCourse} className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Add Course</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedDepartment('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses List ({filteredCourses.length} courses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{departments.find(d => d.id === course.department_id)?.name || 'N/A'}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        course.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(course)}
                          className="text-red-600 hover:text-red-700"
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
        onOpenChange={(open) => setDeleteConfirm({ open, course: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Course"
        description={`Are you sure you want to delete ${deleteConfirm.course?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default ManageCourses;
