
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, ClipboardList, Users, BarChart3, GraduationCap, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AssignmentList from './assignments/AssignmentList';
import CreateAssignment from './assignments/CreateAssignment';
import SubmissionGrading from './assignments/SubmissionGrading';

interface AssignmentStats {
  totalAssignments: number;
  pendingGrading: number;
  activeAssignments: number;
  completedSubmissions: number;
}

const AssignmentsQuizzes: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState<AssignmentStats>({
    totalAssignments: 0,
    pendingGrading: 0,
    activeAssignments: 0,
    completedSubmissions: 0
  });
  const { toast } = useToast();

  const getCurrentTeacherId = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('id')
      .eq('employee_id', currentUser.employee_id || 'TCH001')
      .single();
      
    if (error) {
      console.error('Error fetching teacher:', error);
      return null;
    }
    
    return teacher?.id;
  };

  const loadStats = async () => {
    try {
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) return;

      // Get total assignments
      const { count: totalAssignments } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId);

      // Get active assignments
      const { count: activeAssignments } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)
        .eq('status', 'published');

      // Get assignment IDs for this teacher
      const { data: teacherAssignments } = await supabase
        .from('assignments')
        .select('id')
        .eq('teacher_id', teacherId);

      const assignmentIds = teacherAssignments?.map(a => a.id) || [];

      // Get pending grading count
      const { count: pendingGrading } = await supabase
        .from('student_submissions')
        .select('*', { count: 'exact', head: true })
        .in('assignment_id', assignmentIds)
        .in('grading_status', ['pending', 'auto_graded']);

      // Get completed submissions
      const { count: completedSubmissions } = await supabase
        .from('student_submissions')
        .select('*', { count: 'exact', head: true })
        .in('assignment_id', assignmentIds)
        .eq('grading_status', 'completed');

      setStats({
        totalAssignments: totalAssignments || 0,
        pendingGrading: pendingGrading || 0,
        activeAssignments: activeAssignments || 0,
        completedSubmissions: completedSubmissions || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error",
        description: "Failed to load statistics",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleAssignmentCreated = () => {
    setShowCreateModal(false);
    loadStats();
    toast({
      title: "Success",
      description: "Assignment created successfully",
    });
  };

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header - Orange Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Assignments & Quizzes</h1>
              <p className="text-orange-100">
                Create, manage, and grade assignments with automatic MCQ checking
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.totalAssignments}</div>
            <p className="text-xs text-orange-600 mt-1">Assignments</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Active</CardTitle>
            <ClipboardList className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{stats.activeAssignments}</div>
            <p className="text-xs text-amber-600 mt-1">Published</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.pendingGrading}</div>
            <p className="text-xs text-yellow-600 mt-1">To Review</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Completed</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.completedSubmissions}</div>
            <p className="text-xs text-orange-600 mt-1">Graded</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-orange-50 p-1 rounded-lg">
              <TabsTrigger 
                value="assignments" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <ClipboardList className="h-4 w-4" />
                <span>Assignments</span>
              </TabsTrigger>
              <TabsTrigger 
                value="grading" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Grading</span>
              </TabsTrigger>
              <TabsTrigger 
                value="submissions" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Submissions</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="assignments">
                <AssignmentList onStatsUpdate={loadStats} />
              </TabsContent>
              
              <TabsContent value="grading">
                <SubmissionGrading onStatsUpdate={loadStats} />
              </TabsContent>
              
              <TabsContent value="submissions">
                <div className="text-center py-8">
                  <p className="text-gray-600">Select an assignment from the Assignments tab to view submissions</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignment
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleAssignmentCreated}
        />
      )}
    </div>
  );
};

export default AssignmentsQuizzes;
