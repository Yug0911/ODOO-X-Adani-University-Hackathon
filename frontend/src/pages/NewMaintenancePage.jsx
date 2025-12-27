import { useState, useEffect } from 'react';
import api from '../services/api';

const NewMaintenancePage = () => {
  const [showComments, setShowComments] = useState(false);
  const [status, setStatus] = useState('New Request');
  const [formData, setFormData] = useState({
    subject: '',
    maintenance_for: 'Equipment',
    selected_id: '',
    category_id: '',
    request_type: 'Corrective',
    assigned_team_id: '',
    assigned_technician_id: '',
    scheduled_date: '',
    duration_hours: '',
    priority: 'Medium'
  });
  const [equipment, setEquipment] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipRes, wcRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/work-centers')
      ]);
      if (equipRes.data.success) setEquipment(equipRes.data.data);
      if (wcRes.data.success) setWorkCenters(wcRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'selected_id' && formData.maintenance_for === 'Equipment') {
      // Auto-fill category when equipment is selected
      const selectedEquip = equipment.find(eq => eq.id == value);
      if (selectedEquip) {
        setFormData(prev => ({ ...prev, category_id: selectedEquip.category_id || '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit logic here
    console.log('Form data:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">NEW Maintenance Request</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setShowComments(!showComments)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Worksheet Comments
              </button>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'New Request' ? 'bg-blue-100 text-blue-800' :
                  status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'Repaired' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-white border-b p-4">
          <h3 className="text-lg font-medium mb-2">Worksheet Comments</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows="4"
            placeholder="Add comments about the maintenance work..."
          ></textarea>
        </div>
      )}

      {/* Form */}
      <div className="py-8">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-6">Create Maintenance Request</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <textarea
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows="3"
                  required
                />
              </div>

              {/* Created By */}
              <div>
                <label className="block text-sm font-medium mb-2">Created By</label>
                <input
                  type="text"
                  value="Current User"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                  readOnly
                />
              </div>

              {/* Equipment/Work Center */}
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance For</label>
                <div className="flex space-x-4 mb-2">
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
                <select
                  name="selected_id"
                  value={formData.selected_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select...</option>
                  {(formData.maintenance_for === 'Equipment' ? equipment : workCenters).map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category_id}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                  readOnly
                />
              </div>

              {/* Request Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Request Date</label>
                <input
                  type="date"
                  value={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                  readOnly
                />
              </div>

              {/* Maintenance Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Type</label>
                <div className="flex space-x-4">
                  <label>
                    <input
                      type="radio"
                      name="request_type"
                      value="Corrective"
                      checked={formData.request_type === 'Corrective'}
                      onChange={handleChange}
                    />
                    Corrective
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="request_type"
                      value="Preventive"
                      checked={formData.request_type === 'Preventive'}
                      onChange={handleChange}
                    />
                    Preventive
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Team */}
              <div>
                <label className="block text-sm font-medium mb-2">Assigned Team</label>
                <select
                  name="assigned_team_id"
                  value={formData.assigned_team_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Team</option>
                  {/* Add team options */}
                </select>
              </div>

              {/* Technician */}
              <div>
                <label className="block text-sm font-medium mb-2">Assigned Technician</label>
                <select
                  name="assigned_technician_id"
                  value={formData.assigned_technician_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Technician</option>
                  {/* Add technician options */}
                </select>
              </div>

              {/* Schedule Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Scheduled Date</label>
                <input
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">Duration (Hours)</label>
                <input
                  type="number"
                  name="duration_hours"
                  value={formData.duration_hours}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <input
                  type="text"
                  value="Default Company"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMaintenancePage;