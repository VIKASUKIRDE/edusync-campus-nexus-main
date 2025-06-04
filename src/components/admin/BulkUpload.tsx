
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStudents } from '@/hooks/useStudents';
import { useTeachers } from '@/hooks/useTeachers';
import { useDepartments } from '@/hooks/useDepartments';

const BulkUpload: React.FC = () => {
  const [uploadType, setUploadType] = useState<'students' | 'teachers' | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);
  
  const { addStudent } = useStudents();
  const { addTeacher } = useTeachers();
  const { departments } = useDepartments();
  const { toast } = useToast();

  const downloadTemplate = (type: 'students' | 'teachers') => {
    const studentHeaders = 'Name,Email,Mobile,Department,Semester,Section,Password\n';
    const studentSample = 'John Doe,john@example.com,1234567890,Computer Science,1st,A,password123\n';
    
    const teacherHeaders = 'Name,Email,Mobile,Department,Qualification,Experience,Subjects,Password\n';
    const teacherSample = 'Dr. Jane Smith,jane@example.com,0987654321,Computer Science,Ph.D. Computer Science,5 years,"Programming, Algorithms",password123\n';
    
    const content = type === 'students' 
      ? studentHeaders + studentSample
      : teacherHeaders + teacherSample;
    
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: `${type} CSV template has been downloaded`,
    });
  };

  const parseCSV = (csvText: string): string[][] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const findDepartmentId = (departmentName: string): string | null => {
    const dept = departments.find(d => 
      d.name.toLowerCase() === departmentName.toLowerCase()
    );
    return dept?.id || null;
  };

  const processFile = async () => {
    if (!file || !uploadType) return;

    setUploading(true);
    setResults(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const headers = rows[0];
      const dataRows = rows.slice(1);

      let successCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNum = i + 2; // +2 because we skip header and arrays are 0-indexed

        try {
          if (uploadType === 'students') {
            const [name, email, mobile, department, semester, section, password] = row;
            
            if (!name || !email || !mobile || !department || !semester || !section) {
              errors.push(`Row ${rowNum}: Missing required fields`);
              continue;
            }

            const departmentId = findDepartmentId(department);
            if (!departmentId) {
              errors.push(`Row ${rowNum}: Department "${department}" not found`);
              continue;
            }

            const { error } = await addStudent({
              name: name.trim(),
              email: email.trim(),
              mobile: mobile.trim(),
              department_id: departmentId,
              semester: semester.trim(),
              section: section.trim(),
              password: password?.trim() || undefined
            });

            if (error) {
              errors.push(`Row ${rowNum}: ${error.message}`);
            } else {
              successCount++;
            }
          } else if (uploadType === 'teachers') {
            const [name, email, mobile, department, qualification, experience, subjects, password] = row;
            
            if (!name || !email || !mobile || !department) {
              errors.push(`Row ${rowNum}: Missing required fields`);
              continue;
            }

            const departmentId = findDepartmentId(department);
            if (!departmentId) {
              errors.push(`Row ${rowNum}: Department "${department}" not found`);
              continue;
            }

            const subjectsArray = subjects ? subjects.split(',').map(s => s.trim()) : [];

            const { error } = await addTeacher({
              name: name.trim(),
              email: email.trim(),
              mobile: mobile.trim(),
              department_id: departmentId,
              qualification: qualification?.trim() || '',
              experience: experience?.trim() || '',
              subjects: subjectsArray,
              password: password?.trim() || undefined
            });

            if (error) {
              errors.push(`Row ${rowNum}: ${error.message}`);
            } else {
              successCount++;
            }
          }
        } catch (error) {
          errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setResults({ success: successCount, errors });
      
      if (successCount > 0) {
        toast({
          title: "Upload Completed",
          description: `Successfully uploaded ${successCount} records`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the CSV file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload</h1>
        <p className="text-gray-600">Import multiple records from CSV files</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Download */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Download Templates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Download CSV templates to ensure your data is formatted correctly
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => downloadTemplate('students')}
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Student Template
              </Button>
              <Button 
                variant="outline" 
                onClick={() => downloadTemplate('teachers')}
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Teacher Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="upload-type">Upload Type</Label>
              <Select value={uploadType} onValueChange={(value: 'students' | 'teachers') => setUploadType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select what to upload" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <Button 
              onClick={processFile}
              disabled={!file || !uploadType || uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {results.errors.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span>Upload Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Successfully uploaded {results.success} records
                  </span>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <X className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">
                      {results.errors.length} errors occurred
                    </span>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. Download the appropriate CSV template for your data type</p>
          <p>2. Fill in your data following the template format</p>
          <p>3. Save the file as CSV format</p>
          <p>4. Select the upload type and choose your CSV file</p>
          <p>5. Click "Upload CSV" to import the data</p>
          <p className="text-yellow-600">
            <strong>Note:</strong> Department names must match existing departments exactly
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUpload;
