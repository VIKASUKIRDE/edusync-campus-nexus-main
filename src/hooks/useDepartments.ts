
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Department = Tables<'departments'>;

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async (departmentData: { name: string; head_name?: string; established_year?: number }) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert(departmentData)
        .select()
        .single();

      if (error) throw error;
      
      await fetchDepartments();
      return { data, error: null };
    } catch (error) {
      console.error('Error adding department:', error);
      return { data: null, error };
    }
  };

  const updateDepartment = async (id: string, departmentData: Partial<{ name: string; head_name?: string; established_year?: number }>) => {
    try {
      const { error } = await supabase
        .from('departments')
        .update(departmentData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchDepartments();
      return { error: null };
    } catch (error) {
      console.error('Error updating department:', error);
      return { error };
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchDepartments();
      return { error: null };
    } catch (error) {
      console.error('Error deleting department:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    refetch: fetchDepartments
  };
};
