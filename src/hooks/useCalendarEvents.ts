import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CalendarEvent {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  event_type: 'task' | 'live_class' | 'assignment' | 'topic' | 'meeting' | 'reminder' | 'personal';
  start_date: string;
  end_date?: string;
  all_day: boolean;
  status: 'pending' | 'completed' | 'cancelled' | 'in_progress';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
  location?: string;
  attendees: any[];
  reminder_minutes: number;
  recurring_pattern?: string;
  recurring_end_date?: string;
  subject_id?: string;
  assignment_id?: string;
  live_class_id?: string;
  week_number?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_type: CalendarEvent['event_type'];
  start_date: string;
  end_date?: string;
  all_day?: boolean;
  status?: CalendarEvent['status'];
  priority?: CalendarEvent['priority'];
  color?: string;
  location?: string;
  reminder_minutes?: number;
  recurring_pattern?: string;
  recurring_end_date?: string;
  subject_id?: string;
  notes?: string;
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
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

  const loadEvents = async () => {
    try {
      setLoading(true);
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) return;

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('start_date', { ascending: true });

      if (error) throw error;

      console.log('Calendar events loaded:', data);
      // Transform the data to match our interface with proper type casting
      const transformedEvents: CalendarEvent[] = (data || []).map(event => ({
        ...event,
        attendees: Array.isArray(event.attendees) ? event.attendees : [],
        all_day: event.all_day || false,
        reminder_minutes: event.reminder_minutes || 15,
        week_number: event.week_number || undefined,
        event_type: event.event_type as CalendarEvent['event_type'],
        status: event.status as CalendarEvent['status'],
        priority: event.priority as CalendarEvent['priority']
      }));
      
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: CreateEventData) => {
    try {
      const teacherId = await getCurrentTeacherId();
      if (!teacherId) throw new Error('Teacher not found');

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          teacher_id: teacherId,
          status: eventData.status || 'pending',
          priority: eventData.priority || 'medium',
          color: eventData.color || '#3b82f6',
          all_day: eventData.all_day || false,
          reminder_minutes: eventData.reminder_minutes || 15,
          attendees: []
        })
        .select()
        .single();

      if (error) throw error;

      await loadEvents();
      
      toast({
        title: "Success",
        description: "Event created successfully",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateEvent = async (id: string, updates: Partial<CreateEventData>) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadEvents();
      
      toast({
        title: "Success",
        description: "Event updated successfully",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadEvents();
      
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateEventStatus = async (id: string, status: CalendarEvent['status']) => {
    return updateEvent(id, { status });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    refetch: loadEvents
  };
};
