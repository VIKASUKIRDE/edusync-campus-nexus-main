
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Eye,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  teacher_id: string;
  teachers?: any;
}

interface Topic {
  id: string;
  topic_name: string;
  description: string;
  week_number: number;
  status: string;
  estimated_hours: number;
}

interface Material {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

const StudentSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getCurrentStudent = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const { data: student, error } = await supabase
      .from('students')
      .select('id, semester, section, department_id')
      .eq('login_id', currentUser.login_id || 'STU001')
      .single();

    if (error) {
      console.error('Error fetching student:', error);
      return null;
    }
    return student;
  };

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const student = await getCurrentStudent();
      if (!student) return;

      // Get enrolled subjects
      const { data: enrollments, error } = await supabase
        .from('subject_enrollments')
        .select(`
          subject_id,
          subjects (
            *,
            teachers (name, email)
          )
        `)
        .eq('student_id', student.id)
        .eq('status', 'active');

      if (error) {
        console.error('Error loading subjects:', error);
        return;
      }

      const subjectsList = enrollments?.map(e => e.subjects).filter(Boolean) || [];
      setSubjects(subjectsList);
      
      if (subjectsList.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectsList[0]);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectDetails = async (subjectId: string) => {
    try {
      // Load topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('subject_topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('week_number');

      if (topicsError) {
        console.error('Error loading topics:', topicsError);
      } else {
        setTopics(topicsData || []);
      }

      // Load materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('subject_materials')
        .select('*')
        .eq('subject_id', subjectId)
        .order('uploaded_at', { ascending: false });

      if (materialsError) {
        console.error('Error loading materials:', materialsError);
      } else {
        setMaterials(materialsData || []);
      }
    } catch (error) {
      console.error('Error loading subject details:', error);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadSubjectDetails(selectedSubject.id);
    }
  }, [selectedSubject]);

  const handleDownloadMaterial = async (material: Material) => {
    try {
      window.open(material.file_url, '_blank');
    } catch (error) {
      console.error('Error downloading material:', error);
      toast({
        title: "Error",
        description: "Failed to download material",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressPercentage = () => {
    if (topics.length === 0) return 0;
    const completedTopics = topics.filter(t => t.status === 'completed').length;
    return Math.round((completedTopics / topics.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">My Subjects</h1>
              <p className="text-purple-100">
                Access course materials, topics, and track your progress
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-100">Enrolled Subjects</div>
              <div className="text-3xl font-bold">{subjects.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Subjects List */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                      selectedSubject?.id === subject.id
                        ? 'bg-purple-50 border-l-4 border-purple-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-medium text-slate-900">{subject.name}</div>
                    <div className="text-sm text-slate-500">{subject.code}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {subject.teachers?.name}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Details */}
        <div className="lg:col-span-3">
          {selectedSubject ? (
            <div className="space-y-6">
              {/* Subject Info */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedSubject.name}</CardTitle>
                      <p className="text-slate-600 mt-1">{selectedSubject.code}</p>
                    </div>
                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                      Progress: {getProgressPercentage()}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{selectedSubject.description}</p>
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">Instructor:</span> {selectedSubject.teachers?.name}
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">Email:</span> {selectedSubject.teachers?.email}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for Topics and Materials */}
              <Tabs defaultValue="topics" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                  <TabsTrigger value="topics">Course Topics ({topics.length})</TabsTrigger>
                  <TabsTrigger value="materials">Materials ({materials.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="topics" className="mt-6">
                  <div className="space-y-4">
                    {topics.length > 0 ? (
                      topics.map((topic) => (
                        <Card key={topic.id} className="shadow-sm border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="font-semibold text-slate-900">{topic.topic_name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    Week {topic.week_number}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      topic.status === 'completed' 
                                        ? 'border-green-200 text-green-700 bg-green-50'
                                        : topic.status === 'in_progress'
                                        ? 'border-blue-200 text-blue-700 bg-blue-50'
                                        : 'border-gray-200 text-gray-700 bg-gray-50'
                                    }`}
                                  >
                                    {topic.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {topic.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                                    {topic.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-slate-600 text-sm mb-2">{topic.description}</p>
                                <div className="text-xs text-slate-500">
                                  Estimated Duration: {topic.estimated_hours} hours
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No topics available yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="materials" className="mt-6">
                  <div className="space-y-4">
                    {materials.length > 0 ? (
                      materials.map((material) => (
                        <Card key={material.id} className="shadow-sm border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-slate-900 truncate">{material.title}</h3>
                                  <p className="text-slate-600 text-sm truncate">{material.description}</p>
                                  <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                                    <span>{material.file_type.toUpperCase()}</span>
                                    <span>{formatFileSize(material.file_size)}</span>
                                    <span>{new Date(material.uploaded_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(material.file_url, '_blank')}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadMaterial(material)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No materials available yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Select a subject to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSubjects;
