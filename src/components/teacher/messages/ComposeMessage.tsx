
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Send, 
  Paperclip, 
  X, 
  Calendar,
  AlertTriangle,
  Users,
  User,
  Upload,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComposeMessageProps {
  onClose: () => void;
  onSent: () => void;
}

interface Student {
  id: string;
  name: string;
  email: string;
  semester: string;
  section: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

const ComposeMessage: React.FC<ComposeMessageProps> = ({ onClose, onSent }) => {
  const { sendMessage, uploadFile } = useMessages();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    recipientType: 'student' as 'student' | 'teacher' | 'class' | 'semester' | 'section',
    recipientId: '',
    subject: '',
    content: '',
    isImportant: false,
    scheduledAt: '',
    attachments: [] as File[]
  });
  
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [semesters] = useState(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']);
  const [sections] = useState(['A', 'B', 'C', 'D', 'E']);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadStudents();
    loadTeachers();
  }, []);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, semester, section')
        .order('name');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, name, email')
        .order('name');
      
      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Limit file size to 10MB
    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter(file => file.size <= maxSize);
    
    if (validFiles.length !== files.length) {
      toast({
        title: "File size limit",
        description: "Some files were too large (max 10MB)",
        variant: "destructive",
      });
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getRecipientFilters = () => {
    const filters: any = {};
    
    if (formData.recipientType === 'semester') {
      filters.semester = formData.recipientId;
    } else if (formData.recipientType === 'section') {
      const [semester, section] = formData.recipientId.split('-');
      filters.semester = semester;
      filters.section = section;
    } else if (formData.recipientType === 'class') {
      // For class, we'll need to specify which class
      // This could be enhanced based on your class structure
    }
    
    return Object.keys(filters).length > 0 ? filters : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (formData.recipientType === 'student' && !formData.recipientId) {
      toast({
        title: "Recipient required",
        description: "Please select a recipient",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Handle file uploads
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let messageType: 'text' | 'image' | 'pdf' | 'link' | 'file' = 'text';

      if (formData.attachments.length > 0) {
        setUploading(true);
        const file = formData.attachments[0]; // For now, handle one file
        
        fileUrl = await uploadFile(file);
        if (!fileUrl) {
          throw new Error('Failed to upload file');
        }
        
        fileName = file.name;
        fileSize = file.size;
        
        // Determine message type based on file
        if (file.type.startsWith('image/')) {
          messageType = 'image';
        } else if (file.type === 'application/pdf') {
          messageType = 'pdf';
        } else {
          messageType = 'file';
        }
      }

      // Check if content contains URLs for link type
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (urlRegex.test(formData.content) && messageType === 'text') {
        messageType = 'link';
      }

      const messageData = {
        recipient_id: ['student', 'teacher'].includes(formData.recipientType) 
          ? formData.recipientId 
          : undefined,
        recipient_type: formData.recipientType,
        recipient_filters: getRecipientFilters(),
        subject: formData.subject || undefined,
        content: formData.content,
        message_type: messageType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        scheduled_at: formData.scheduledAt || undefined,
        is_important: formData.isImportant
      };

      const { error } = await sendMessage(messageData);
      
      if (error) throw error;

      onSent();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const getRecipientLabel = () => {
    switch (formData.recipientType) {
      case 'student': return 'Select Student';
      case 'teacher': return 'Select Teacher';
      case 'semester': return 'Select Semester';
      case 'section': return 'Select Section';
      case 'class': return 'All Students';
      default: return 'Select Recipient';
    }
  };

  const renderRecipientOptions = () => {
    switch (formData.recipientType) {
      case 'student':
        return students.map(student => (
          <SelectItem key={student.id} value={student.id}>
            {student.name} - {student.semester} {student.section}
          </SelectItem>
        ));
      
      case 'teacher':
        return teachers.map(teacher => (
          <SelectItem key={teacher.id} value={teacher.id}>
            {teacher.name}
          </SelectItem>
        ));
      
      case 'semester':
        return semesters.map(semester => (
          <SelectItem key={semester} value={semester}>
            {semester} Semester
          </SelectItem>
        ));
      
      case 'section':
        return semesters.flatMap(semester => 
          sections.map(section => (
            <SelectItem key={`${semester}-${section}`} value={`${semester}-${section}`}>
              {semester} Semester - Section {section}
            </SelectItem>
          ))
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Compose Message</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Recipient Type</Label>
              <Select 
                value={formData.recipientType} 
                onValueChange={(value: any) => setFormData(prev => ({ 
                  ...prev, 
                  recipientType: value,
                  recipientId: '' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Individual Student</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="teacher">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Teacher</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="semester">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Entire Semester</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="section">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Section</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="class">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>All Students</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Selection */}
            {formData.recipientType !== 'class' && (
              <div>
                <Label>Recipient</Label>
                <Select 
                  value={formData.recipientId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, recipientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={getRecipientLabel()} />
                  </SelectTrigger>
                  <SelectContent>
                    {renderRecipientOptions()}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <Label>Subject (Optional)</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Message subject..."
            />
          </div>

          {/* Message Content */}
          <div>
            <Label>Message *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Type your message here..."
              rows={6}
              required
            />
          </div>

          {/* Attachments */}
          <div>
            <Label>Attachments</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Attach Files'}
                </Button>
                <span className="text-sm text-slate-500">Max 10MB per file</span>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        ) : file.type === 'application/pdf' ? (
                          <FileText className="h-4 w-4 text-red-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-slate-500" />
                        )}
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-slate-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Important */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isImportant}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isImportant: checked }))}
              />
              <Label className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>Mark as Important</span>
              </Label>
            </div>

            {/* Schedule */}
            <div>
              <Label className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Schedule for later (Optional)</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          {/* Preview */}
          {(formData.recipientType === 'semester' || formData.recipientType === 'section' || formData.recipientType === 'class') && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Group Message</span>
              </div>
              <p className="text-sm text-blue-700">
                This message will be sent to multiple recipients based on your selection.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {formData.scheduledAt ? 'Schedule' : 'Send'} Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeMessage;
