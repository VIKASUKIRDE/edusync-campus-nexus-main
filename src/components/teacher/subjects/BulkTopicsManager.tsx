
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2 } from 'lucide-react';

interface BulkTopicsManagerProps {
  subjectId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TopicForm {
  topic_name: string;
  description: string;
  week_number: string;
  estimated_hours: string;
  status: string;
}

const BulkTopicsManager: React.FC<BulkTopicsManagerProps> = ({
  subjectId,
  open,
  onClose,
  onSuccess
}) => {
  const [topics, setTopics] = useState<TopicForm[]>([
    {
      topic_name: '',
      description: '',
      week_number: '1',
      estimated_hours: '2',
      status: 'pending'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const addTopic = () => {
    setTopics([...topics, {
      topic_name: '',
      description: '',
      week_number: '1',
      estimated_hours: '2',
      status: 'pending'
    }]);
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      setTopics(topics.filter((_, i) => i !== index));
    }
  };

  const updateTopic = (index: number, field: keyof TopicForm, value: string) => {
    const updatedTopics = [...topics];
    updatedTopics[index][field] = value;
    setTopics(updatedTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate topics
      const validTopics = topics.filter(topic => topic.topic_name.trim());
      if (validTopics.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one topic with a name",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('Bulk inserting topics for subject:', subjectId);
      console.log('Topics data:', validTopics);

      // Prepare topics data for bulk insert
      const topicsData = validTopics.map(topic => ({
        topic_name: topic.topic_name.trim(),
        description: topic.description.trim() || null,
        week_number: parseInt(topic.week_number) || 1,
        estimated_hours: parseInt(topic.estimated_hours) || 2,
        status: topic.status
      }));

      console.log('Formatted topics data:', topicsData);

      // Use the bulk insert function with proper JSON formatting
      const { data, error } = await supabase.rpc('bulk_insert_topics', {
        p_subject_id: subjectId,
        p_topics: topicsData
      });

      if (error) {
        console.error('Bulk insert error:', error);
        throw error;
      }

      console.log('Bulk insert successful:', data);

      toast({
        title: "Success",
        description: `${validTopics.length} topics added successfully`,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error adding topics:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add topics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTopics([{
      topic_name: '',
      description: '',
      week_number: '1',
      estimated_hours: '2',
      status: 'pending'
    }]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-900">
            Add Multiple Topics
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {topics.map((topic, index) => (
            <div key={index} className="border border-purple-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-800">Topic {index + 1}</h3>
                {topics.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTopic(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`topic_name_${index}`}>Topic Name *</Label>
                  <Input
                    id={`topic_name_${index}`}
                    value={topic.topic_name}
                    onChange={(e) => updateTopic(index, 'topic_name', e.target.value)}
                    placeholder="Enter topic name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`week_number_${index}`}>Week Number</Label>
                  <Input
                    id={`week_number_${index}`}
                    type="number"
                    min="1"
                    max="52"
                    value={topic.week_number}
                    onChange={(e) => updateTopic(index, 'week_number', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`description_${index}`}>Description</Label>
                <Textarea
                  id={`description_${index}`}
                  value={topic.description}
                  onChange={(e) => updateTopic(index, 'description', e.target.value)}
                  placeholder="Describe what will be covered in this topic..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`estimated_hours_${index}`}>Estimated Hours</Label>
                  <Input
                    id={`estimated_hours_${index}`}
                    type="number"
                    min="1"
                    max="100"
                    value={topic.estimated_hours}
                    onChange={(e) => updateTopic(index, 'estimated_hours', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`status_${index}`}>Status</Label>
                  <Select 
                    value={topic.status} 
                    onValueChange={(value) => updateTopic(index, 'status', value)}
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
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addTopic}
            className="w-full border-dashed border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Topic
          </Button>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Adding Topics...' : `Add ${topics.filter(t => t.topic_name.trim()).length} Topics`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkTopicsManager;
