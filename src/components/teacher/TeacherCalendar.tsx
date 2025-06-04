
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Circle
} from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CalendarGrid from './calendar/CalendarGrid';
import EventList from './calendar/EventList';
import CreateEventModal from './calendar/CreateEventModal';
import EventDetailsModal from './calendar/EventDetailsModal';
import { ConfirmDialog } from '@/components/ui/alert-dialog-confirm';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

const TeacherCalendar: React.FC = () => {
  const { events, loading, createEvent, updateEvent, deleteEvent, updateEventStatus } = useCalendarEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.start_date);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  // Apply filters to upcoming events
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start_date);
    const today = new Date();
    const isUpcoming = eventDate > today;
    
    // Apply status filter
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    
    // Apply type filter  
    if (typeFilter !== 'all' && event.event_type !== typeFilter) return false;
    
    return isUpcoming;
  }).slice(0, 10); // Show more items for filtered results

  const pendingTasks = events.filter(event => 
    event.status === 'pending' && (event.event_type === 'task' || event.event_type === 'assignment')
  );

  const completedTasks = events.filter(event => 
    event.status === 'completed' && (event.event_type === 'task' || event.event_type === 'assignment')
  );

  const filteredEvents = events.filter(event => {
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    if (typeFilter !== 'all' && event.event_type !== typeFilter) return false;
    return true;
  });

  // Apply filters to task events too
  const filteredTasks = events.filter(event => {
    const isTask = event.event_type === 'task' || event.event_type === 'assignment';
    if (!isTask) return false;
    
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    if (typeFilter !== 'all' && event.event_type !== typeFilter) return false;
    
    return true;
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDeleteClick = async (event: any) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      await deleteEvent(eventToDelete.id);
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8 p-3 sm:p-0">
      {/* Enhanced Header Section - Green Theme for Calendar */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/5 rounded-full -translate-y-24 sm:-translate-y-48 translate-x-24 sm:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/5 rounded-full translate-y-16 sm:translate-y-32 -translate-x-16 sm:-translate-x-32"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl">
              <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Calendar & Tasks</h1>
              <p className="text-lg sm:text-xl text-white/90 mb-2 sm:mb-3">
                Manage your schedule, assignments, and personal tasks
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">{todayEvents.length}</span>
                  <span className="text-white/80 text-sm sm:text-base">Today's Events</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">{pendingTasks.length}</span>
                  <span className="text-white/80 text-sm sm:text-base">Pending Tasks</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            size="lg" 
            className="w-full lg:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/20 text-white shadow-xl"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Today's Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{todayEvents.length}</div>
            <p className="text-xs text-green-600 mt-1">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{completedTasks.length}</div>
            <p className="text-xs text-emerald-600 mt-1">Tasks finished</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">{pendingTasks.length}</div>
            <p className="text-xs text-teal-600 mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Events</CardTitle>
            <Filter className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{events.length}</div>
            <p className="text-xs text-green-600 mt-1">All time events</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Interface */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <Tabs defaultValue="calendar" className="w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <TabsList className="grid w-full lg:w-auto grid-cols-3 bg-green-100 p-1 rounded-xl">
                <TabsTrigger value="calendar" className="data-[state=active]:bg-white rounded-lg">
                  Calendar View
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-white rounded-lg">
                  Task List
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-white rounded-lg">
                  Upcoming
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Types</option>
                  <option value="task">Tasks</option>
                  <option value="live_class">Live Classes</option>
                  <option value="assignment">Assignments</option>
                  <option value="topic">Topics</option>
                  <option value="meeting">Meetings</option>
                  <option value="reminder">Reminders</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
            </div>

            <TabsContent value="calendar">
              <div className="space-y-4">
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handlePrevMonth} className="border-green-200 hover:bg-green-50">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleToday} className="border-green-200 hover:bg-green-50">
                        Today
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleNextMonth} className="border-green-200 hover:bg-green-50">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Month
                    </Button>
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Week
                    </Button>
                    <Button
                      variant={viewMode === 'day' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('day')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Day
                    </Button>
                  </div>
                </div>

                <CalendarGrid
                  currentDate={currentDate}
                  events={filteredEvents}
                  viewMode={viewMode}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  onEventClick={setSelectedEvent}
                  getEventTypeColor={getEventTypeColor}
                  getStatusIcon={getStatusIcon}
                />
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <EventList
                events={filteredTasks}
                onEventClick={setSelectedEvent}
                onStatusUpdate={updateEventStatus}
                onDeleteClick={handleDeleteClick}
                getEventTypeColor={getEventTypeColor}
                getStatusIcon={getStatusIcon}
                title="Task Management"
                showStatusActions={true}
              />
            </TabsContent>

            <TabsContent value="upcoming">
              <EventList
                events={upcomingEvents}
                onEventClick={setSelectedEvent}
                onStatusUpdate={updateEventStatus}
                onDeleteClick={handleDeleteClick}
                getEventTypeColor={getEventTypeColor}
                getStatusIcon={getStatusIcon}
                title="Upcoming Events"
                showStatusActions={false}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreateEventModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={createEvent}
          selectedDate={selectedDate}
        />
      )}

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={updateEvent}
          onDelete={handleDeleteClick}
          onStatusUpdate={updateEventStatus}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        description={`Are you sure you want to delete "${eventToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default TeacherCalendar;
