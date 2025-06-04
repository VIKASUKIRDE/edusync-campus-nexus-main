
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  FileText, 
  Clock, 
  Users, 
  Plus,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  PlayCircle,
  Link,
  Eye
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  syllabus_url?: string;
}

interface Topic {
  id: string;
  topic_name: string;
  description: string;
  week_number: number;
  estimated_hours: number;
  status: string;
  created_at: string;
}

interface Material {
  id: string;
  title: string;
  description: string;
  file_type: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
}

interface SubjectDetailsModalProps {
  subject: Subject | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const SubjectDetailsModal: React.FC<SubjectDetailsModalProps> = ({
  subject,
  open,
  onClose,
  onUpdate
}) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && subject) {
      loadSubjectData();
    }
  }, [open, subject]);

  const loadSubjectData = async () => {
    if (!subject) return;
    
    setLoading(true);
    try {
      // Load topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('subject_topics')
        .select('*')
        .eq('subject_id', subject.id)
        .order('week_number', { ascending: true });

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);

      // Load materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('subject_materials')
        .select('*')
        .eq('subject_id', subject.id)
        .order('uploaded_at', { ascending: false });

      if (materialsError) throw materialsError;
      setMaterials(materialsData || []);

      // Load enrolled students count
      const { count, error: countError } = await supabase
        .from('subject_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('subject_id', subject.id)
        .eq('status', 'active');

      if (countError) throw countError;
      setEnrolledCount(count || 0);

    } catch (error: any) {
      console.error('Error loading subject data:', error);
      toast({
        title: "Error",
        description: "Failed to load subject details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTopicStatus = async (topicId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('subject_topics')
        .update({ status: newStatus })
        .eq('id', topicId);

      if (error) throw error;

      // Update local state
      setTopics(prev => prev.map(topic => 
        topic.id === topicId ? { ...topic, status: newStatus } : topic
      ));

      toast({
        title: "Success",
        description: "Topic status updated successfully",
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error updating topic status:', error);
      toast({
        title: "Error",
        description: "Failed to update topic status",
        variant: "destructive",
      });
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      const { error } = await supabase
        .from('subject_topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;

      setTopics(prev => prev.filter(topic => topic.id !== topicId));
      
      toast({
        title: "Success",
        description: "Topic deleted successfully",
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error deleting topic:', error);
      toast({
        title: "Error",
        description: "Failed to delete topic",
        variant: "destructive",
      });
    }
  };

  const deleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const { error } = await supabase
        .from('subject_materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      setMaterials(prev => prev.filter(material => material.id !== materialId));
      
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error deleting material:', error);
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  const getCompletionPercentage = () => {
    if (topics.length === 0) return 0;
    const completedTopics = topics.filter(topic => topic.status === 'completed').length;
    return Math.round((completedTopics / topics.length) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'url':
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (!subject) return null;

  const completionPercentage = getCompletionPercentage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-900">
            {subject.code} - {subject.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Topics</p>
                    <p className="text-xl font-semibold">{topics.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Materials</p>
                    <p className="text-xl font-semibold">{materials.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Enrolled</p>
                    <p className="text-xl font-semibold">{enrolledCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-xl font-semibold">{completionPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Course Progress</span>
              <span className="text-sm text-purple-600">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2 bg-purple-100" />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="topics" className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="topics">Topics ({topics.length})</TabsTrigger>
              <TabsTrigger value="materials">Materials ({materials.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="topics" className="mt-4 h-full overflow-y-auto">
              <div className="space-y-4">
                {topics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No topics added yet</p>
                  </div>
                ) : (
                  topics.map((topic) => (
                    <Card key={topic.id} className="border border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(topic.status)}
                              <h3 className="font-semibold text-purple-900">{topic.topic_name}</h3>
                              <Badge className={`text-xs ${getStatusColor(topic.status)}`}>
                                {topic.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            {topic.description && (
                              <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Week {topic.week_number}</span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {topic.estimated_hours}h
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Select
                              value={topic.status}
                              onValueChange={(value) => updateTopicStatus(topic.id, value)}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTopic(topic.id)}
                              className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="materials" className="mt-4 h-full overflow-y-auto">
              <div className="space-y-4">
                {materials.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No materials uploaded yet</p>
                  </div>
                ) : (
                  materials.map((material) => (
                    <Card key={material.id} className="border border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              {getFileIcon(material.file_type)}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-purple-900">{material.title}</h3>
                              {material.description && (
                                <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                <span className="capitalize">{material.file_type}</span>
                                {material.file_size && (
                                  <span>{formatFileSize(material.file_size)}</span>
                                )}
                                <span>{new Date(material.uploaded_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(material.file_url, '_blank')}
                              className="h-8"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMaterial(material.id)}
                              className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectDetailsModal;
