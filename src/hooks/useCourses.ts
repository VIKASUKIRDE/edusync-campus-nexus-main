
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Course = Tables<'courses'>;
type CourseInsert = {
  code: string;
  name: string;
  department_id: string;
  semester: string;
  credits?: number;
  duration?: string;
  status?: string;
};

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          departments (name)
        `)
        .order('name');
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (courseData: CourseInsert) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          code: courseData.code,
          name: courseData.name,
          department_id: courseData.department_id,
          semester: courseData.semester,
          credits: courseData.credits || 3,
          duration: courseData.duration || '16 weeks',
          status: courseData.status || 'Active'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchCourses();
      return { data, error: null };
    } catch (error) {
      console.error('Error adding course:', error);
      return { data: null, error };
    }
  };

  const updateCourse = async (id: string, courseData: Partial<CourseInsert>) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchCourses();
      return { error: null };
    } catch (error) {
      console.error('Error updating course:', error);
      return { error };
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchCourses();
      return { error: null };
    } catch (error) {
      console.error('Error deleting course:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    addCourse,
    updateCourse,
    deleteCourse,
    refetch: fetchCourses
  };
};
