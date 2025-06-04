
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, Download, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Reports: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalDepartments: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, teachersRes, coursesRes, departmentsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('departments').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalCourses: coursesRes.count || 0,
        totalDepartments: departmentsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStudentReport = async (format: 'csv' | 'json') => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          login_id,
          name,
          email,
          mobile,
          semester,
          section,
          enrollment_date,
          departments (name)
        `);

      if (error) throw error;

      if (format === 'csv') {
        const csvContent = convertToCSV(data);
        downloadFile(csvContent, 'students_report.csv', 'text/csv');
      } else {
        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, 'students_report.json', 'application/json');
      }

      toast({
        title: "Success",
        description: `Student report generated successfully in ${format.toUpperCase()} format`,
      });
    } catch (error) {
      console.error('Error generating student report:', error);
      toast({
        title: "Error",
        description: "Failed to generate student report",
        variant: "destructive",
      });
    }
  };

  const generateTeacherReport = async (format: 'csv' | 'json') => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          employee_id,
          name,
          email,
          mobile,
          qualification,
          experience,
          subjects,
          departments (name)
        `);

      if (error) throw error;

      if (format === 'csv') {
        const csvContent = convertToCSV(data);
        downloadFile(csvContent, 'teachers_report.csv', 'text/csv');
      } else {
        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, 'teachers_report.json', 'application/json');
      }

      toast({
        title: "Success",
        description: `Teacher report generated successfully in ${format.toUpperCase()} format`,
      });
    } catch (error) {
      console.error('Error generating teacher report:', error);
      toast({
        title: "Error",
        description: "Failed to generate teacher report",
        variant: "destructive",
      });
    }
  };

  const generateDepartmentReport = async (format: 'csv' | 'json') => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          name,
          head_name,
          established_year,
          students:students(count),
          teachers:teachers(count),
          courses:courses(count)
        `);

      if (error) throw error;

      if (format === 'csv') {
        const csvContent = convertToCSV(data);
        downloadFile(csvContent, 'departments_report.csv', 'text/csv');
      } else {
        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, 'departments_report.json', 'application/json');
      }

      toast({
        title: "Success",
        description: `Department report generated successfully in ${format.toUpperCase()} format`,
      });
    } catch (error) {
      console.error('Error generating department report:', error);
      toast({
        title: "Error",
        description: "Failed to generate department report",
        variant: "destructive",
      });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'object' && value !== null) {
          return Array.isArray(value) ? `"${value.join('; ')}"` : `"${JSON.stringify(value)}"`;
        }
        return `"${value || ''}"`;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reports = [
    {
      title: 'Student Report',
      description: 'Complete list of all students with department and semester details',
      generateFn: generateStudentReport
    },
    {
      title: 'Teacher Report',
      description: 'Faculty list with department and subject assignments',
      generateFn: generateTeacherReport
    },
    {
      title: 'Department Report',
      description: 'Department-wise statistics and summary',
      generateFn: generateDepartmentReport
    }
  ];

  if (loading) {
    return <div className="flex justify-center p-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and download various administrative reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalTeachers}</div>
            <div className="text-sm text-gray-600">Total Teachers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalCourses}</div>
            <div className="text-sm text-gray-600">Active Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalDepartments}</div>
            <div className="text-sm text-gray-600">Departments</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 size={20} className="text-blue-500" />
                <span>{report.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{report.description}</p>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => report.generateFn('csv')}
                  className="flex items-center space-x-1"
                >
                  <FileSpreadsheet size={14} className="text-green-600" />
                  <span>CSV</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => report.generateFn('json')}
                  className="flex items-center space-x-1"
                >
                  <FileText size={14} className="text-blue-600" />
                  <span>JSON</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
