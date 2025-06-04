
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubjectTopicsManagerProps {
  subjectId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SubjectTopicsManager: React.FC<SubjectTopicsManagerProps> = ({
  subjectId,
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    topic_name: '',
    description: '',
    week_number: '',
    estimated_hours: '2',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.topic_name.trim()) {
        throw new Error('Topic name is required');
      }

      console.log('Adding topic with data:', {
        subject_id: subjectId,
        topic_name: formData.topic_name.trim(),
        description: formData.description.trim() || null,
        week_number: parseInt(formData.week_number) || 1,
        estimated_hours: parseInt(formData.estimated_hours) || 2,
        status: formData.status
      });

      const { data, error } = await supabase
        .from('subject_topics')
        .insert({
          subject_id: subjectId,
          topic_name: formData.topic_name.trim(),
          description: formData.description.trim() || null,
          week_number: parseInt(formData.week_number) || 1,
          estimated_hours: parseInt(formData.estimated_hours) || 2,
          status: formData.status
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Topic added successfully:', data);

      toast({
        title: "Success",
        description: "Topic added successfully",
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error adding topic:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add topic",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      topic_name: '',
      description: '',
      week_number: '',
      estimated_hours: '2',
      status: 'pending'
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-900">
            Add Course Topic
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="topic_name">Topic Name *</Label>
              <Input
                id="topic_name"
                value={formData.topic_name}
                onChange={(e) => setFormData(prev => ({ ...prev, topic_name: e.target.value }))}
                placeholder="Enter topic name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="week_number">Week Number</Label>
              <Input
                id="week_number"
                type="number"
                min="1"
                max="52"
                value={formData.week_number}
                onChange={(e) => setFormData(prev => ({ ...prev, week_number: e.target.value }))}
                placeholder="1"
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
              placeholder="Describe what will be covered in this topic..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                min="1"
                max="100"
                value={formData.estimated_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              {loading ? 'Adding...' : 'Add Topic'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectTopicsManager;
