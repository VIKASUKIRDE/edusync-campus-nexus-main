
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Plus, 
  Search, 
  GraduationCap,
  Users,
  FileText,
  Clock,
  CheckCircle,
  Target,
  TrendingUp,
  Edit,
  Trash2,
  ChevronRight,
  Activity,
  BarChart3,
  Eye,
  FolderOpen,
  UserPlus,
  ListPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/ui/alert-dialog-confirm';
import CreateSubjectModal from './subjects/CreateSubjectModal';
import SubjectDetailsModal from './subjects/SubjectDetailsModal';
import SubjectMaterialsManager from './subjects/SubjectMaterialsManager';
import SubjectTopicsManager from './subjects/SubjectTopicsManager';
import BulkTopicsManager from './subjects/BulkTopicsManager';
import StudentEnrollmentManager from './subjects/StudentEnrollmentManager';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  syllabus_url?: string;
  materials_count?: number;
  topics_count?: number;
  active_topics?: number;
  completed_topics?: number;
  students_count?: number;
}

const TeacherSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [showBulkTopicsModal, setShowBulkTopicsModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const { toast } = useToast();

  const getCurrentTeacherEmployeeId = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.employee_id || 'TCH001';
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const teacherEmployeeId = getCurrentTeacherEmployeeId();
      
      // Get teacher ID first
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('employee_id', teacherEmployeeId)
        .single();

      if (teacherError) throw teacherError;

      // Get subjects for this teacher
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('teacher_id', teacher.id);

      if (subjectsError) throw subjectsError;

      // Enhance subjects with additional counts
      const enhancedSubjects = await Promise.all(
        (subjectsData || []).map(async (subject) => {
          // Get materials count
          const { count: materialsCount } = await supabase
            .from('subject_materials')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id);

          // Get topics count
          const { count: topicsCount } = await supabase
            .from('subject_topics')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id);

          // Get active topics count
          const { count: activeTopics } = await supabase
            .from('subject_topics')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id)
            .eq('status', 'in_progress');

          // Get completed topics count
          const { count: completedTopics } = await supabase
            .from('subject_topics')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id)
            .eq('status', 'completed');

          // Get enrolled students count
          const { count: studentsCount } = await supabase
            .from('subject_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id)
            .eq('status', 'active');

          return {
            ...subject,
            materials_count: materialsCount || 0,
            topics_count: topicsCount || 0,
            active_topics: activeTopics || 0,
            completed_topics: completedTopics || 0,
            students_count: studentsCount || 0
          };
        })
      );

      setSubjects(enhancedSubjects);
    } catch (error: any) {
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

  const handleCreateClick = () => {
    setSubjectToEdit(null);
    setShowCreateModal(true);
  };

  const handleEditClick = (subject: Subject) => {
    setSubjectToEdit(subject);
    setShowCreateModal(true);
  };

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setShowDeleteConfirm(true);
  };

  const handleViewDetails = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowDetailsModal(true);
  };

  const handleManageMaterials = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowMaterialsModal(true);
  };

  const handleManageTopics = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowTopicsModal(true);
  };

  const handleBulkTopics = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowBulkTopicsModal(true);
  };

  const handleManageEnrollment = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowEnrollmentModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectToDelete.id);

      if (error) throw error;

      setShowDeleteConfirm(false);
      setSubjectToDelete(null);
      loadSubjects();
      
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const handleModalSuccess = () => {
    setShowCreateModal(false);
    setShowMaterialsModal(false);
    setShowTopicsModal(false);
    setShowBulkTopicsModal(false);
    setShowEnrollmentModal(false);
    setSubjectToEdit(null);
    setSelectedSubject(null);
    loadSubjects();
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompletionPercentage = (subject: Subject) => {
    if (subject.topics_count === 0) return 0;
    return Math.round(((subject.completed_topics || 0) / subject.topics_count) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-pulse p-3 sm:p-0">
        <div className="h-48 sm:h-64 bg-gradient-to-r from-purple-200 to-violet-300 rounded-2xl sm:rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 sm:h-64 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8 p-3 sm:p-0">
      {/* Enhanced Header Section - Purple Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/5 rounded-full -translate-y-24 sm:-translate-y-48 translate-x-24 sm:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/5 rounded-full translate-y-16 sm:translate-y-32 -translate-x-16 sm:-translate-x-32"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">My Subjects</h1>
              <p className="text-lg sm:text-xl text-white/90 mb-2 sm:mb-3">
                Manage your subjects, materials, and curriculum
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">{subjects.length}</span>
                  <span className="text-white/80 text-sm sm:text-base">Total Subjects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">
                    {subjects.reduce((acc, subj) => acc + (subj.active_topics || 0), 0)}
                  </span>
                  <span className="text-white/80 text-sm sm:text-base">Active Topics</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="w-full lg:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/20 text-white shadow-xl"
            onClick={handleCreateClick}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Create Subject
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-purple-100 space-y-4 sm:space-y-0">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {filteredSubjects.length} Subjects
          </Badge>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSubjects.map((subject) => {
          const completionPercentage = getCompletionPercentage(subject);
          
          return (
            <Card 
              key={subject.id} 
              className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl">
                      <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm sm:text-lg font-bold text-purple-900">
                        {subject.code}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-purple-600">
                        {subject.name}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-purple-600 hover:bg-purple-100 h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(subject);
                      }}
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-purple-600 hover:bg-purple-100 h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(subject);
                      }}
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600 hover:bg-red-100 h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(subject);
                      }}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                {subject.description && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {subject.description}
                  </p>
                )}
                
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-purple-700">Course Progress</span>
                    <span className="text-xs sm:text-sm text-purple-600">{completionPercentage}%</span>
                  </div>
                  <Progress 
                    value={completionPercentage} 
                    className="h-1.5 sm:h-2 bg-purple-100"
                  />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2">
                  <div className="flex items-center space-x-1 sm:space-x-2 p-2 bg-purple-50 rounded-lg">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-purple-900">
                        {subject.materials_count}
                      </div>
                      <div className="text-xs text-purple-600">Materials</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2 p-2 bg-purple-50 rounded-lg">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-purple-900">
                        {subject.topics_count}
                      </div>
                      <div className="text-xs text-purple-600">Topics</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2 p-2 bg-purple-50 rounded-lg">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-purple-900">
                        {subject.students_count}
                      </div>
                      <div className="text-xs text-purple-600">Students</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2 p-2 bg-purple-50 rounded-lg">
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-purple-900">
                        {subject.active_topics}
                      </div>
                      <div className="text-xs text-purple-600">Active</div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManageMaterials(subject);
                    }}
                  >
                    <FolderOpen className="h-3 w-3 mr-1" />
                    Materials
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManageTopics(subject);
                    }}
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Topics
                  </Button>
                </div>

                {/* Additional Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkTopics(subject);
                    }}
                  >
                    <ListPlus className="h-3 w-3 mr-1" />
                    Bulk Topics
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManageEnrollment(subject);
                    }}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Students
                  </Button>
                </div>

                {/* Main Action Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                  size="sm"
                  onClick={() => handleViewDetails(subject)}
                >
                  <span className="text-xs sm:text-sm">Manage Subject</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSubjects.length === 0 && !loading && (
        <div className="text-center py-12 sm:py-16">
          <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <GraduationCap className="h-12 w-12 sm:h-16 sm:w-16 text-purple-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No subjects found</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first subject'}
          </p>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
            onClick={handleCreateClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Subject
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateSubjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleModalSuccess}
        subjectToEdit={subjectToEdit}
      />

      <SubjectDetailsModal
        subject={selectedSubject}
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onUpdate={loadSubjects}
      />

      <SubjectMaterialsManager
        subjectId={selectedSubject?.id || ''}
        open={showMaterialsModal}
        onClose={() => setShowMaterialsModal(false)}
        onSuccess={handleModalSuccess}
      />

      <SubjectTopicsManager
        subjectId={selectedSubject?.id || ''}
        open={showTopicsModal}
        onClose={() => setShowTopicsModal(false)}
        onSuccess={handleModalSuccess}
      />

      <BulkTopicsManager
        subjectId={selectedSubject?.id || ''}
        open={showBulkTopicsModal}
        onClose={() => setShowBulkTopicsModal(false)}
        onSuccess={handleModalSuccess}
      />

      <StudentEnrollmentManager
        subjectId={selectedSubject?.id || ''}
        subjectName={selectedSubject?.name || ''}
        open={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject"
        description={`Are you sure you want to delete "${subjectToDelete?.name}"? This action cannot be undone and will remove all associated materials and topics.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default TeacherSubjects;
