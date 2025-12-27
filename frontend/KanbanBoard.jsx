import { useEffect, useState } from 'react';
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const KanbanBoard = () => {
  const [requests, setRequests] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetch('/api/kanban')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error(err));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      const newStatus = overId; // Column id is the status
      updateRequestStatus(activeId, newStatus);
    }

    setActiveId(null);
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Update local state
        setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = ['New Request', 'In Progress', 'Repaired', 'Scrap'];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-4 p-6">
        {columns.map((status) => (
          <Column key={status} id={status} title={status}>
            <SortableContext items={requests.filter(r => r.status === status).map(r => r.id)} strategy={verticalListSortingStrategy}>
              {requests.filter(r => r.status === status).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </SortableContext>
          </Column>
        ))}
      </div>
      <DragOverlay>
        {activeId ? <RequestCard request={requests.find(r => r.id === activeId)} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

const Column = ({ id, title, children }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-lg w-80">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
};

const RequestCard = ({ request }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 mb-2 rounded shadow cursor-pointer"
    >
      <h3 className="font-bold">{request.subject}</h3>
      <p>{request.target_name}</p>
      <p>Priority: {'★'.repeat(request.priority || 1)}</p>
      <img src={request.avatar_url || '/default-avatar.png'} alt="Tech Avatar" className="w-8 h-8 rounded-full mt-2" />
    </div>
  );
};

export default KanbanBoard;