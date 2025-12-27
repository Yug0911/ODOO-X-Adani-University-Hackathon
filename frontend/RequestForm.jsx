import { useState, useEffect } from 'react';

const RequestForm = () => {
  const [formData, setFormData] = useState({
    subject: '',
    maintenance_for: 'Equipment',
    selected_id: '',
    request_type: '',
    assigned_technician_id: '',
    scheduled_date: ''
  });
  const [equipment, setEquipment] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);

  useEffect(() => {
    fetch('/api/equipment').then(res => res.json()).then(data => setEquipment(data));
    fetch('/api/work-centers').then(res => res.json()).then(data => setWorkCenters(data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selected_id) {
      alert('Please select an item');
      return;
    }

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Request created successfully');
        setFormData({
          subject: '',
          maintenance_for: 'Equipment',
          selected_id: '',
          request_type: '',
          assigned_technician_id: '',
          scheduled_date: ''
        });
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create Maintenance Request</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Subject</label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Maintenance For</label>
        <div className="flex space-x-4">
          <label>
            <input
              type="radio"
              name="maintenance_for"
              value="Equipment"
              checked={formData.maintenance_for === 'Equipment'}
              onChange={handleChange}
            />
            Equipment
          </label>
          <label>
            <input
              type="radio"
              name="maintenance_for"
              value="Work Center"
              checked={formData.maintenance_for === 'Work Center'}
              onChange={handleChange}
            />
            Work Center
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          {formData.maintenance_for === 'Equipment' ? 'Select Equipment' : 'Select Work Center'}
        </label>
        <select
          name="selected_id"
          value={formData.selected_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select...</option>
          {(formData.maintenance_for === 'Equipment' ? equipment : workCenters).map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Request Type</label>
        <input
          type="text"
          name="request_type"
          value={formData.request_type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Assigned Technician ID</label>
        <input
          type="number"
          name="assigned_technician_id"
          value={formData.assigned_technician_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Scheduled Date</label>
        <input
          type="date"
          name="scheduled_date"
          value={formData.scheduled_date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Submit Request
      </button>
    </form>
  );
};

export default RequestForm;