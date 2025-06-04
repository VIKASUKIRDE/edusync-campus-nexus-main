import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import EditEventModal from './EditEventModal';
import { format } from 'date-fns';
import { 
  Clock, 
  MapPin, 
  Bell, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Play, 
  Square,
  Calendar,
  User,
  FileText
} from 'lucide-react';

interface EventDetailsModalProps {
  event: CalendarEvent;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onStatusUpdate: (id: string, status: CalendarEvent['status']) => Promise<any>;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  open,
  onClose,
  onUpdate,
  onDelete,
  onStatusUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleStatusChange = async (newStatus: CalendarEvent['status']) => {
    setLoading(true);
    try {
      await onStatusUpdate(event.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setLoading(true);
      try {
        await onDelete(event.id);
        onClose();
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSave = async (id: string, updates: any) => {
    await onUpdate(id, updates);
    setShowEditModal(false);
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      task: 'bg-blue-100 text-blue-800 border-blue-200',
      live_class: 'bg-green-100 text-green-800 border-green-200',
      assignment: 'bg-orange-100 text-orange-800 border-orange-200',
      topic: 'bg-purple-100 text-purple-800 border-purple-200',
      meeting: 'bg-red-100 text-red-800 border-red-200',
      reminder: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      personal: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.task;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold mb-2">{event.title}</DialogTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getEventTypeColor(event.event_type)}>
                    {event.event_type.replace('_', ' ')}
                  </Badge>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                  <Badge className={getPriorityColor(event.priority)}>
                    {event.priority} priority
                  </Badge>
                </div>
              </div>
              <div 
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: event.color }}
              />
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Event Description */}
            {event.description && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Description
                </h4>
                <p className="text-gray-600">{event.description}</p>
              </div>
            )}

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p className="text-gray-600">
                      {format(new Date(event.start_date), 'MMM d, yyyy')}
                      {!event.all_day && ` at ${format(new Date(event.start_date), 'h:mm a')}`}
                    </p>
                  </div>
                </div>

                {event.end_date && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-gray-600">
                        {format(new Date(event.end_date), 'MMM d, yyyy')}
                        {!event.all_day && ` at ${format(new Date(event.end_date), 'h:mm a')}`}
                      </p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {event.reminder_minutes > 0 && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Bell className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Reminder</p>
                      <p className="text-gray-600">
                        {event.reminder_minutes < 60 
                          ? `${event.reminder_minutes} minutes before`
                          : event.reminder_minutes < 1440
                          ? `${Math.floor(event.reminder_minutes / 60)} hours before`
                          : `${Math.floor(event.reminder_minutes / 1440)} days before`
                        }
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-gray-600">
                      {format(new Date(event.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {event.notes && (
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-600">{event.notes}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                {event.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('completed')}
                    disabled={loading}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
                
                {event.status !== 'in_progress' && event.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={loading}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                )}
                
                {event.status === 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('pending')}
                    disabled={loading}
                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Mark Pending
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {showEditModal && (
        <EditEventModal
          event={event}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}
    </>
  );
};

export default EventDetailsModal;
