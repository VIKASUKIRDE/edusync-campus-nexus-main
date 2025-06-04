
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStudentData = () => {
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getCurrentStudent = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('login_id', currentUser.login_id || 'STU001')
        .single();

      if (error) {
        console.error('Error fetching student:', error);
        return null;
      }

      setCurrentStudent(student);
      return student;
    } catch (error) {
      console.error('Error in getCurrentStudent:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentStudent();
  }, []);

  return {
    currentStudent,
    loading,
    refetch: getCurrentStudent
  };
};
