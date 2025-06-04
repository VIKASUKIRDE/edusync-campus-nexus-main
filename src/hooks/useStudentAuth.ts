
import { useEffect } from 'react';
import { useStudentData } from '@/hooks/useStudentData';

export const useStudentAuth = () => {
  const { currentStudent } = useStudentData();

  useEffect(() => {
    // Set user context in localStorage for RLS policies
    if (currentStudent?.login_id) {
      localStorage.setItem('current_student_login_id', currentStudent.login_id);
    }
  }, [currentStudent?.login_id]);

  return { currentStudent };
};
