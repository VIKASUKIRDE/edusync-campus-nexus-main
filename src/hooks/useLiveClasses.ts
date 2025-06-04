
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LiveClass {
  id: string;
  teacher_id: string;
  subject_id?: string;
  title: string;
  description?: string;
  class_date: string;
  start_time: string;
  end_time: string;
  platform: 'zoom' | 'google_meet' | 'microsoft_teams' | 'other';
  meeting_link: string;
  meeting_id?: string;
  meeting_password?: string;
  semester: string;
  section: string;
  max_participants: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  recording_link?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  subject_name?: string;
  subject_code?: string;
}

export interface CreateLiveClassData {
  title: string;
  description?: string;
  subject_id?: string;
  class_date: string;
  start_time: string;
  end_time: string;
  platform: 'zoom' | 'google_meet' | 'microsoft_teams' | 'other';
  meeting_link: string;
  meeting_id?: string;
  meeting_password?: string;
  semester: string;
  section: string;
  max_participants?: number;
  notes?: string;
}

export interface StudentEnrollment {
  id: string;
  name: string;
  login_id: string;
  email: string;
}

export const useLiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getCurrentTeacherId = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log('Getting teacher ID for user:', currentUser);
    
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('id')
      .eq('employee_id', currentUser.employee_id || 'TCH001')
      .single();

    if (error) {
      console.error('Error fetching teacher:', error);
      return null;
    }
    console.log('Found teacher:', teacher);
    return teacher?.id;
  };

  const loadLiveClasses = async () => {
    try {
      setLoading(true);
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) {
        console.log('No teacher ID found');
        return;
      }

      console.log('Loading live classes for teacher:', teacherId);

      const { data, error } = await supabase
        .from('live_classes')
        .select(`
          *,
          subjects (name, code)
        `)
        .eq('teacher_id', teacherId)
        .order('class_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error loading live classes:', error);
        throw error;
      }

      console.log('Raw live classes data:', data);

      const enhancedClasses: LiveClass[] = (data || []).map(cls => ({
        id: cls.id,
        teacher_id: cls.teacher_id,
        subject_id: cls.subject_id,
        title: cls.title,
        description: cls.description || '',
        class_date: cls.class_date,
        start_time: cls.start_time,
        end_time: cls.end_time,
        platform: cls.platform as 'zoom' | 'google_meet' | 'microsoft_teams' | 'other',
        meeting_link: cls.meeting_link,
        meeting_id: cls.meeting_id,
        meeting_password: cls.meeting_password,
        semester: cls.semester,
        section: cls.section,
        max_participants: cls.max_participants || 100,
        status: cls.status as 'scheduled' | 'live' | 'completed' | 'cancelled',
        recording_link: cls.recording_link,
        notes: cls.notes,
        created_at: cls.created_at,
        updated_at: cls.updated_at,
        subject_name: cls.subjects && typeof cls.subjects === 'object' && 'name' in cls.subjects ? cls.subjects.name : '',
        subject_code: cls.subjects && typeof cls.subjects === 'object' && 'code' in cls.subjects ? cls.subjects.code : ''
      }));

      console.log('Enhanced live classes:', enhancedClasses);
      setLiveClasses(enhancedClasses);
    } catch (error) {
      console.error('Error loading live classes:', error);
      toast({
        title: "Error",
        description: "Failed to load live classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLiveClass = async (classData: CreateLiveClassData) => {
    try {
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) throw new Error('Teacher not found');

      console.log('Creating live class with data:', { ...classData, teacher_id: teacherId });

      const { data, error } = await supabase
        .from('live_classes')
        .insert({
          ...classData,
          teacher_id: teacherId,
          max_participants: classData.max_participants || 100,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating live class:', error);
        throw error;
      }

      console.log('Created live class:', data);
      await loadLiveClasses();
      
      toast({
        title: "Success",
        description: "Live class scheduled successfully",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating live class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create live class",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateLiveClass = async (id: string, updates: Partial<CreateLiveClassData>) => {
    try {
      console.log('Updating live class:', id, updates);
      
      const { error } = await supabase
        .from('live_classes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating live class:', error);
        throw error;
      }

      await loadLiveClasses();
      
      toast({
        title: "Success",
        description: "Live class updated successfully",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error updating live class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update live class",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteLiveClass = async (id: string) => {
    try {
      console.log('Deleting live class:', id);
      
      const { error } = await supabase
        .from('live_classes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting live class:', error);
        throw error;
      }

      await loadLiveClasses();
      
      toast({
        title: "Success",
        description: "Live class deleted successfully",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting live class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete live class",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateClassStatus = async (id: string, status: LiveClass['status']) => {
    try {
      console.log('Updating class status:', id, 'to', status);
      
      const { error } = await supabase
        .from('live_classes')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating class status:', error);
        throw error;
      }

      await loadLiveClasses();
      
      toast({
        title: "Success",
        description: `Class status updated to ${status}`,
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error updating class status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update class status",
        variant: "destructive",
      });
      return { error };
    }
  };

  const getEnrolledStudents = async (semester: string, section: string) => {
    try {
      console.log('Getting enrolled students for:', { semester, section });
      
      const { data, error } = await supabase
        .from('students')
        .select('id, name, login_id, email, mobile')
        .eq('semester', semester)
        .eq('section', section)
        .order('name');

      if (error) {
        console.error('Error fetching enrolled students:', error);
        throw error;
      }

      console.log('Found enrolled students:', data);
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching enrolled students:', error);
      return { data: [], error };
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('live-classes-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_classes'
        },
        (payload) => {
          console.log('Live class real-time update:', payload);
          loadLiveClasses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    loadLiveClasses();
  }, []);

  return {
    liveClasses,
    loading,
    createLiveClass,
    updateLiveClass,
    deleteLiveClass,
    updateClassStatus,
    getEnrolledStudents,
    refetch: loadLiveClasses
  };
};
