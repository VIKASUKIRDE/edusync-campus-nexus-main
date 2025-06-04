
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Video, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LiveClass, CreateLiveClassData } from '@/hooks/useLiveClasses';

interface EditLiveClassProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  liveClass: LiveClass | null;
  onUpdate: (id: string, updates: Partial<CreateLiveClassData>) => Promise<{ error: any }>;
}

const EditLiveClass: React.FC<EditLiveClassProps> = ({ 
  open, 
  onClose, 
  onSuccess, 
  liveClass,
  onUpdate 
}) => {
  const [formData, setFormData] = useState<CreateLiveClassData>({
    title: '',
    description: '',
    class_date: '',
    start_time: '',
    end_time: '',
    platform: 'zoom',
    meeting_link: '',
    meeting_id: '',
    meeting_password: '',
    semester: '',
    section: '',
    subject_id: '',
    max_participants: 100,
    notes: ''
  });

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && liveClass) {
      setFormData({
        title: liveClass.title,
        description: liveClass.description || '',
        class_date: liveClass.class_date,
        start_time: liveClass.start_time,
        end_time: liveClass.end_time,
        platform: liveClass.platform,
        meeting_link: liveClass.meeting_link,
        meeting_id: liveClass.meeting_id || '',
        meeting_password: liveClass.meeting_password || '',
        semester: liveClass.semester,
        section: liveClass.section,
        subject_id: liveClass.subject_id || '',
        max_participants: liveClass.max_participants,
        notes: liveClass.notes || ''
      });
      loadSubjects();
    }
  }, [open, liveClass]);

  const loadSubjects = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('employee_id', currentUser.employee_id || 'TCH001')
        .single();

      if (teacher) {
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('*')
          .eq('teacher_id', teacher.id);

        setSubjects(subjectsData || []);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleSubmit = async () => {
    if (!liveClass) return;
    
    if (!formData.title || !formData.class_date || !formData.start_time || !formData.end_time || !formData.meeting_link || !formData.semester || !formData.section) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.start_time >= formData.end_time) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await onUpdate(liveClass.id, formData);
      
      if (!error) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error updating live class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update live class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Live Class</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5" />
                <span>Class Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Class Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter class title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Class description and objectives"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subject_id">Subject</Label>
                  <Select value={formData.subject_id} onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="semester">Semester *</Label>
                  <Input
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                    placeholder="e.g., 1, 2, 3"
                  />
                </div>
                <div>
                  <Label htmlFor="section">Section *</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    placeholder="e.g., A, B, C"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="class_date">Date *</Label>
                  <Input
                    id="class_date"
                    type="date"
                    value={formData.class_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, class_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meeting Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Meeting Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="platform">Platform *</Label>
                <Select 
                  value={formData.platform} 
                  onValueChange={(value: 'zoom' | 'google_meet' | 'microsoft_teams' | 'other') => 
                    setFormData(prev => ({ ...prev, platform: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                    <SelectItem value="microsoft_teams">Microsoft Teams</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="meeting_link">Meeting Link *</Label>
                <Input
                  id="meeting_link"
                  type="url"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_link: e.target.value }))}
                  placeholder="https://zoom.us/j/123456789"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meeting_id">Meeting ID</Label>
                  <Input
                    id="meeting_id"
                    value={formData.meeting_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, meeting_id: e.target.value }))}
                    placeholder="Meeting ID (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="meeting_password">Meeting Password</Label>
                  <Input
                    id="meeting_password"
                    value={formData.meeting_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, meeting_password: e.target.value }))}
                    placeholder="Password (optional)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 100 }))}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the class"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Updating...' : 'Update Class'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLiveClass;
