import { useEffect, useState } from 'react';
import api from '../services/api';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance-requests/calendar');
      const formattedEvents = response.data.data.map(req => ({
        id: req.id,
        title: `${req.subject} - ${req.equipment_name || req.work_center_name}`,
        start: req.scheduled_date,
        backgroundColor: getColorByStatus(req.status),
        extendedProps: { requestData: req }
      }));
      setEvents(formattedEvents);
      setError(null);
    } catch (err) {
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const getColorByStatus = (status) => {
    switch(status) {
      case 'New Request': return '#2563eb';
      case 'In Progress': return '#f59e0b';
      case 'Repaired': return '#16a34a';
      default: return '#64748b';
    }
  };

  const handleDateClick = (info) => {
    // Open RequestForm with scheduled_date pre-filled
    const selectedDate = info.dateStr;
    alert(`Create new preventive request for ${selectedDate}`);
    // In real implementation, open modal with pre-filled date
  };

  const handleEventClick = (info) => {
    // Open Request Details modal
    const requestData = info.event.extendedProps.requestData;
    alert(`View details for: ${requestData.subject}`);
    // In real implementation, open details modal
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCalendarEvents} />;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Maintenance Calendar</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Preventive Maintenance Schedule</h2>
          <div className="flex space-x-2">
            <span className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              New Request
            </span>
            <span className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              In Progress
            </span>
            <span className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              Repaired
            </span>
          </div>
        </div>

        {/* Simple calendar implementation - in real app use FullCalendar */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold bg-gray-100">
              {day}
            </div>
          ))}

          {/* Generate calendar days - simplified version */}
          {Array.from({ length: 35 }, (_, i) => {
            const dayEvents = events.filter(event =>
              new Date(event.start).toDateString() === new Date(2025, 11, i + 1).toDateString()
            );

            return (
              <div
                key={i}
                className="min-h-24 p-2 border cursor-pointer hover:bg-gray-50"
                onClick={() => handleDateClick({ dateStr: `2025-12-${String(i + 1).padStart(2, '0')}` })}
              >
                <div className="text-sm font-medium mb-1">{i + 1}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate"
                      style={{ backgroundColor: event.backgroundColor, color: 'white' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick({ event: { extendedProps: { requestData: event } } });
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;