import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import api from '../services/api';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

function MaintenancePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance-requests');
      setRequests(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      const newStatus = overId; // Column id is the status
      try {
        await api.patch(`/maintenance-requests/${activeId}/status`, { status: newStatus });
        fetchRequests(); // Refresh
        alert('Status updated successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to update status');
      }
    }
  };

  const getRequestsByStage = (stage) => {
    return requests.filter(r => r.status === stage);
  };

  const stages = ['New Request', 'In Progress', 'Repaired', 'Scrap'];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRequests} />;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Maintenance Requests</h1>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto">
          {stages.map((status) => (
            <div key={status} className="bg-gray-100 p-4 rounded-lg w-80 min-h-96">
              <h3 className="text-lg font-bold mb-4">
                {status} ({getRequestsByStage(status).length})
              </h3>
              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    <SortableContext items={getRequestsByStage(status).map(r => r.id)} strategy={verticalListSortingStrategy}>
                      {getRequestsByStage(status).map((request, index) => (
                        <Draggable
                          draggableId={String(request.id)}
                          index={index}
                          key={request.id}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded shadow cursor-pointer border-l-4 relative ${
                                request.is_overdue ? 'border-red-500 bg-red-50' : 'border-blue-500'
                              }`}
                              style={{
                                boxShadow: request.is_overdue ? '0 0 15px rgba(220, 38, 38, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              <h4 className="font-bold">{request.subject}</h4>
                              <p className="text-sm text-gray-600">
                                {request.equipment_name || request.work_center_name}
                              </p>
                              <p className="text-sm">Team: {request.team_name}</p>
                              {request.assigned_technician_name && (
                                <div className="flex items-center mt-2">
                                  <img
                                    src={request.technician_avatar || '/default-avatar.png'}
                                    alt={request.assigned_technician_name}
                                    className="w-6 h-6 rounded-full mr-2"
                                  />
                                  <span className="text-sm">{request.assigned_technician_name}</span>
                                </div>
                              )}
                              <p className="text-xs mt-2">
                                Date: {new Date(request.scheduled_date).toLocaleDateString()}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  request.request_type === 'Corrective' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {request.request_type}
                                </span>
                                <span className="text-xs">
                                  {'◆'.repeat(request.priority || 1)}
                                </span>
                              </div>
                              {request.is_overdue && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </SortableContext>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default MaintenancePage;