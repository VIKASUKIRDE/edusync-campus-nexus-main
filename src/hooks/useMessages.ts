
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  sender_type: 'teacher' | 'student' | 'admin';
  recipient_id?: string;
  recipient_type?: 'teacher' | 'student' | 'admin' | 'class' | 'semester' | 'section' | 'batch';
  recipient_filters?: any;
  subject?: string;
  content: string;
  message_type: 'text' | 'image' | 'pdf' | 'link' | 'file';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  is_starred: boolean;
  is_important: boolean;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  recipient_name?: string;
}

export interface MessageRecipient {
  id: string;
  message_id: string;
  recipient_id: string;
  recipient_type: 'teacher' | 'student' | 'admin';
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const { toast } = useToast();

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

  const loadMessages = async () => {
    try {
      setLoading(true);
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) return;

      // Get messages where teacher is sender or recipient
      const { data: messageData, error } = await supabase
        .from('messages')
        .select(`
          *,
          message_recipients (
            recipient_id,
            recipient_type,
            is_read,
            read_at
          )
        `)
        .or(`sender_id.eq.${teacherId},recipient_id.eq.${teacherId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enhance messages with sender and recipient names
      const enhancedMessages = await Promise.all((messageData || []).map(async (msg) => {
        let senderName = 'Unknown';
        let recipientName = 'Unknown';

        // Get sender name
        if (msg.sender_type === 'teacher') {
          const { data: teacher } = await supabase
            .from('teachers')
            .select('name')
            .eq('id', msg.sender_id)
            .single();
          senderName = teacher?.name || 'Unknown Teacher';
        } else if (msg.sender_type === 'student') {
          const { data: student } = await supabase
            .from('students')
            .select('name')
            .eq('id', msg.sender_id)
            .single();
          senderName = student?.name || 'Unknown Student';
        }

        // Get recipient name
        if (msg.recipient_id && msg.recipient_type === 'teacher') {
          const { data: teacher } = await supabase
            .from('teachers')
            .select('name')
            .eq('id', msg.recipient_id)
            .single();
          recipientName = teacher?.name || 'Unknown Teacher';
        } else if (msg.recipient_id && msg.recipient_type === 'student') {
          const { data: student } = await supabase
            .from('students')
            .select('name')
            .eq('id', msg.recipient_id)
            .single();
          recipientName = student?.name || 'Unknown Student';
        } else if (msg.recipient_type === 'class') {
          recipientName = 'Class Group';
        } else if (msg.recipient_type === 'semester') {
          const filters = msg.recipient_filters as any;
          recipientName = `Semester ${filters?.semester || ''}`;
        } else if (msg.recipient_type === 'section') {
          const filters = msg.recipient_filters as any;
          recipientName = `Section ${filters?.section || ''}`;
        }

        // Type-safe transformation to Message interface
        const transformedMessage: Message = {
          id: msg.id,
          sender_id: msg.sender_id,
          sender_type: msg.sender_type as 'teacher' | 'student' | 'admin',
          recipient_id: msg.recipient_id || undefined,
          recipient_type: msg.recipient_type as 'teacher' | 'student' | 'admin' | 'class' | 'semester' | 'section' | 'batch' | undefined,
          recipient_filters: msg.recipient_filters,
          subject: msg.subject || undefined,
          content: msg.content,
          message_type: msg.message_type as 'text' | 'image' | 'pdf' | 'link' | 'file',
          file_url: msg.file_url || undefined,
          file_name: msg.file_name || undefined,
          file_size: msg.file_size || undefined,
          is_read: msg.is_read || false,
          is_starred: msg.is_starred || false,
          is_important: msg.is_important || false,
          scheduled_at: msg.scheduled_at || undefined,
          created_at: msg.created_at,
          updated_at: msg.updated_at,
          sender_name: senderName,
          recipient_name: recipientName
        };

        return transformedMessage;
      }));

      setMessages(enhancedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageData: {
    recipient_id?: string;
    recipient_type: 'teacher' | 'student' | 'admin' | 'class' | 'semester' | 'section' | 'batch';
    recipient_filters?: any;
    subject?: string;
    content: string;
    message_type?: 'text' | 'image' | 'pdf' | 'link' | 'file';
    file_url?: string;
    file_name?: string;
    file_size?: number;
    scheduled_at?: string;
    is_important?: boolean;
  }) => {
    try {
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) throw new Error('Teacher not found');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: teacherId,
          sender_type: 'teacher',
          ...messageData
        })
        .select()
        .single();

      if (error) throw error;

      // If sending to a group, create message recipients
      if (messageData.recipient_type === 'class' || 
          messageData.recipient_type === 'semester' || 
          messageData.recipient_type === 'section') {
        
        let studentsQuery = supabase.from('students').select('id');
        
        if (messageData.recipient_filters?.semester) {
          studentsQuery = studentsQuery.eq('semester', messageData.recipient_filters.semester);
        }
        if (messageData.recipient_filters?.section) {
          studentsQuery = studentsQuery.eq('section', messageData.recipient_filters.section);
        }

        const { data: students } = await studentsQuery;
        
        if (students && students.length > 0) {
          const recipients = students.map(student => ({
            message_id: data.id,
            recipient_id: student.id,
            recipient_type: 'student' as const
          }));

          await supabase.from('message_recipients').insert(recipients);
        }
      }

      await loadMessages();
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      await loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const toggleStar = async (messageId: string, isStarred: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_starred: !isStarred })
        .eq('id', messageId);

      if (error) throw error;
      await loadMessages();
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-files')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return null;
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'unread') return !message.is_read;
    if (filter === 'starred') return message.is_starred;
    return true;
  });

  useEffect(() => {
    loadMessages();
  }, []);

  return {
    messages: filteredMessages,
    loading,
    filter,
    setFilter,
    sendMessage,
    markAsRead,
    toggleStar,
    uploadFile,
    refetch: loadMessages
  };
};
