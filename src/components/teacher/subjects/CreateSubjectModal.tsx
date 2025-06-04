
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Subject {
  id?: string;
  name: string;
  code: string;
  description: string;
  teacher_id?: string;
  syllabus_url?: string;
}

interface CreateSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjectToEdit?: Subject | null;
}

const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  open,
  onClose,
  onSuccess,
  subjectToEdit
}) => {
  const [formData, setFormData] = useState<Subject>({
    name: '',
    code: '',
    description: '',
    syllabus_url: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (subjectToEdit) {
      setFormData(subjectToEdit);
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        syllabus_url: ''
      });
    }
  }, [subjectToEdit, open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) {
        throw new Error('Teacher not found');
      }

      if (subjectToEdit?.id) {
        // Update existing subject
        const { error } = await supabase
          .from('subjects')
          .update({
            name: formData.name,
            code: formData.code,
            description: formData.description,
            syllabus_url: formData.syllabus_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', subjectToEdit.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
      } else {
        // Create new subject
        const { error } = await supabase
          .from('subjects')
          .insert({
            name: formData.name,
            code: formData.code,
            description: formData.description,
            syllabus_url: formData.syllabus_url,
            teacher_id: teacherId
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Subject created successfully",
        });
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save subject",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      syllabus_url: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {subjectToEdit ? 'Edit Subject' : 'Create New Subject'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Subject Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="e.g., CS101"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Computer Science Fundamentals"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter subject description..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="syllabus_url">Syllabus URL</Label>
            <Input
              id="syllabus_url"
              type="url"
              value={formData.syllabus_url}
              onChange={(e) => setFormData(prev => ({ ...prev, syllabus_url: e.target.value }))}
              placeholder="https://example.com/syllabus.pdf"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Saving...' : (subjectToEdit ? 'Update Subject' : 'Create Subject')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectModal;
