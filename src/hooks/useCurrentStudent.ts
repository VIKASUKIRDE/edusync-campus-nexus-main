
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  login_id: string;
  name: string;
  semester: string;
  section: string;
  email: string;
  mobile: string;
}

export const useCurrentStudent = () => {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getCurrentStudent = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      console.log('Current user from localStorage:', currentUser);
      
      if (!currentUser.login_id) {
        console.error('No login_id found in localStorage');
        setCurrentStudent(null);
        return null;
      }

      const { data: student, error } = await supabase
        .from('students')
        .select('id, login_id, name, semester, section, email, mobile')
        .eq('login_id', currentUser.login_id)
        .single();

      if (error) {
        console.error('Error fetching student:', error);
        toast({
          title: "Error",
          description: "Failed to load student information",
          variant: "destructive",
        });
        setCurrentStudent(null);
        return null;
      }

      console.log('Fetched student data:', student);
      setCurrentStudent(student);
      return student;
    } catch (error) {
      console.error('Error in getCurrentStudent:', error);
      setCurrentStudent(null);
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
