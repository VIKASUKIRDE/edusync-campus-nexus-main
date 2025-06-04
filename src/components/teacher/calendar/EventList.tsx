
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Play,
  Pause,
  X
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { format } from 'date-fns';

interface EventListProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onStatusUpdate: (id: string, status: CalendarEvent['status']) => void;
  onDeleteClick?: (event: CalendarEvent) => void;
  getEventTypeColor: (type: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  title: string;
  showStatusActions?: boolean;
}

const EventList: React.FC<EventListProps> = ({
  events,
  onEventClick,
  onStatusUpdate,
  onDeleteClick,
  getEventTypeColor,
  getStatusIcon,
  title,
  showStatusActions = false
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (events.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">Create your first event to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <CardTitle 
                    className="text-lg font-bold text-gray-900 hover:text-green-600 cursor-pointer"
                    onClick={() => onEventClick(event)}
                  >
                    {event.title}
                  </CardTitle>
                  <Badge className={getEventTypeColor(event.event_type)}>
                    {event.event_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getPriorityColor(event.priority)}>
                    {event.priority.toUpperCase()}
                  </Badge>
                </div>
                
                {event.description && (
                  <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                )}
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.start_date), 'MMM d, yyyy')}</span>
                  </div>
                  
                  {!event.all_day && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.start_date), 'HH:mm')}</span>
                      {event.end_date && (
                        <span>- {format(new Date(event.end_date), 'HH:mm')}</span>
                      )}
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(event.status)}
                    <span className="capitalize">{event.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEventClick(event)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  
                  {showStatusActions && (
                    <>
                      {event.status === 'pending' && (
                        <DropdownMenuItem 
                          onClick={() => onStatusUpdate(event.id, 'in_progress')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </DropdownMenuItem>
                      )}
                      
                      {event.status === 'in_progress' && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => onStatusUpdate(event.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onStatusUpdate(event.id, 'pending')}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {(event.status === 'pending' || event.status === 'in_progress') && (
                        <DropdownMenuItem 
                          onClick={() => onStatusUpdate(event.id, 'cancelled')}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  
                  <DropdownMenuItem 
                    onClick={() => onDeleteClick && onDeleteClick(event)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default EventList;
