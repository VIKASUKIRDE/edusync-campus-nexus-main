
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { CalendarEvent } from '@/hooks/useCalendarEvents';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  viewMode: 'month' | 'week' | 'day';
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  getEventTypeColor: (type: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  viewMode,
  selectedDate,
  onDateSelect,
  onEventClick,
  getEventTypeColor,
  getStatusIcon
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return isSameDay(eventDate, date);
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {weekDays.map((day) => (
          <div key={day} className="p-4 text-center text-sm font-semibold text-slate-600 bg-slate-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-r border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                !isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : ''
              } ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
              onClick={() => onDateSelect(day)}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${
                    isDayToday
                      ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                      : isCurrentMonth
                      ? 'text-slate-900'
                      : 'text-slate-400'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="group cursor-pointer"
                  >
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium truncate border transition-all group-hover:shadow-sm ${getEventTypeColor(event.event_type)}`}
                      style={{ backgroundColor: event.color + '20', borderColor: event.color + '40' }}
                    >
                      <div className="flex items-center space-x-1">
                        <div className="flex-shrink-0">
                          {getStatusIcon(event.status)}
                        </div>
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="px-2 py-1 text-xs text-slate-500 font-medium">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
