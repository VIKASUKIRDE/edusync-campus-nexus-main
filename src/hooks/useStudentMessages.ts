
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StudentMessage {
  id: string;
  sender_id: string;
  sender_type: 'teacher' | 'student' | 'admin';
  recipient_id?: string;
  recipient_type?: 'teacher' | 'student' | 'admin';
  subject?: string;
  content: string;
  message_type: 'text' | 'image' | 'pdf' | 'link' | 'file';
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  is_starred: boolean;
  is_important: boolean;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  recipient_name?: string;
}

export const useStudentMessages = () => {
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const { toast } = useToast();

  const getCurrentStudentId = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const { data: student, error } = await supabase
      .from('students')
      .select('id')
      .eq('login_id', currentUser.login_id || 'STU001')
      .single();

    if (error) {
      console.error('Error fetching student:', error);
      return null;
    }
    return student?.id;
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const studentId = await getCurrentStudentId();
      if (!studentId) return;

      // Get messages where student is sender or recipient
      const { data: messageData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${studentId},recipient_id.eq.${studentId}`)
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
        }

        return {
          ...msg,
          sender_name: senderName,
          recipient_name: recipientName
        } as StudentMessage;
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

  const sendMessage = async (messageData: {
    recipient_id: string;
    subject?: string;
    content: string;
    message_type?: 'text' | 'image' | 'pdf' | 'link' | 'file';
    file_url?: string;
    file_name?: string;
    is_important?: boolean;
  }) => {
    try {
      const studentId = await getCurrentStudentId();
      if (!studentId) throw new Error('Student not found');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: studentId,
          sender_type: 'student',
          recipient_id: messageData.recipient_id,
          recipient_type: 'teacher',
          subject: messageData.subject,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          file_url: messageData.file_url,
          file_name: messageData.file_name,
          is_important: messageData.is_important || false
        })
        .select()
        .single();

      if (error) throw error;

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

  const filteredMessages = messages.filter(message => {
    if (filter === 'unread') return !message.is_read;
    if (filter === 'starred') return message.is_starred;
    return true;
  });

  useEffect(() => {
    loadMessages();
    loadTeachers();
  }, []);

  return {
    messages: filteredMessages,
    teachers,
    loading,
    filter,
    setFilter,
    sendMessage,
    markAsRead,
    toggleStar,
    refetch: loadMessages
  };
};
