import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

function EquipmentPage() {
  const { equipment, loading: contextLoading } = useApp();
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentRequests, setEquipmentRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEquipmentClick = async (equip) => {
    setSelectedEquipment(equip);
    setShowRequests(false);

    try {
      setLoading(true);
      const response = await api.get(`/equipment/${equip.id}/requests`);
      setEquipmentRequests(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load equipment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSmartButtonClick = () => {
    setShowRequests(true);
  };

  const openCount = equipmentRequests.filter(r =>
    r.status !== 'Repaired' && r.status !== 'Scrap'
  ).length;

  if (contextLoading) return <Loading />;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Equipment Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Equipment List</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {equipment.map((equip) => (
              <div
                key={equip.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedEquipment?.id === equip.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleEquipmentClick(equip)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{equip.name}</h3>
                    <p className="text-sm text-gray-600">
                      Serial: {equip.serial_number || 'N/A'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    equip.health_percentage >= 70 ? 'bg-green-100 text-green-800' :
                    equip.health_percentage >= 30 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {equip.health_percentage}% Health
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment Details */}
        <div className="bg-white rounded-lg shadow">
          {selectedEquipment ? (
            <>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Equipment Details</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1">{selectedEquipment.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                    <p className="mt-1">{selectedEquipment.serial_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1">{selectedEquipment.category_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Health</label>
                    <p className="mt-1">{selectedEquipment.health_percentage}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team</label>
                    <p className="mt-1">{selectedEquipment.team_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Technician</label>
                    <p className="mt-1">{selectedEquipment.technician_name || 'N/A'}</p>
                  </div>
                </div>

                {/* Smart Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSmartButtonClick}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <span>Maintenance</span>
                    {openCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {openCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Requests List */}
                {showRequests && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Maintenance Requests</h3>
                    {loading ? (
                      <Loading />
                    ) : error ? (
                      <ErrorMessage message={error} />
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {equipmentRequests.map((request) => (
                          <div
                            key={request.id}
                            className={`p-3 rounded border-l-4 ${
                              request.is_overdue ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{request.subject}</h4>
                                <p className="text-sm text-gray-600">
                                  Status: {request.status} | Priority: {'◆'.repeat(request.priority)}
                                </p>
                                {request.is_overdue && (
                                  <span className="inline-block mt-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                    OVERDUE
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                request.request_type === 'Corrective' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {request.request_type}
                              </span>
                            </div>
                          </div>
                        ))}
                        {equipmentRequests.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No maintenance requests found</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Select an equipment item to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EquipmentPage;