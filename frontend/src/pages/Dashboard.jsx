import { useEffect, useState } from 'react';
import api from '../services/api';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

function Dashboard() {
  const [stats, setStats] = useState({
    critical_equipment: 0,
    technician_load: [],
    open_requests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStats} />;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">GearGuard Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Critical Equipment Card */}
        <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">Critical Equipment</h2>
          <p className="text-4xl mt-4">{stats.critical_equipment}</p>
          <p>Machines at risk (health less than 30%)</p>
        </div>

        {/* Technician Workload Card */}
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">Technician Workload</h2>
          <div className="mt-4">
            {stats.technician_load.length > 0 ? (
              <ul className="space-y-2">
                {stats.technician_load.slice(0, 3).map((tech, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="font-medium">{tech.name}</span>
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                      {tech.task_count} tasks
                    </span>
                  </li>
                ))}
                {stats.technician_load.length > 3 && (
                  <li className="text-center text-sm opacity-75">
                    +{stats.technician_load.length - 3} more technicians
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-center">No active technicians</p>
            )}
          </div>
        </div>

        {/* Open Requests Card */}
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">Open Requests</h2>
          <p className="text-4xl mt-4">{stats.open_requests}</p>
          <p>Pending maintenance tasks</p>
        </div>
      </div>

      {/* Additional Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => window.location.hash = '#maintenance'}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <div className="text-2xl mb-2">🔧</div>
              <div className="font-medium">New Request</div>
            </button>
            <button
              onClick={() => window.location.hash = '#equipment'}
              className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">View Equipment</div>
            </button>
            <button
              onClick={() => window.location.hash = '#calendar'}
              className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium">Schedule Maintenance</div>
            </button>
            <button
              onClick={() => window.location.hash = '#workcenters'}
              className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <div className="text-2xl mb-2">🏭</div>
              <div className="font-medium">Work Centers</div>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Database Connection</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">✅ Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Active Maintenance Requests</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {stats.open_requests} pending
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Equipment Health</span>
              <span className={`px-2 py-1 rounded text-sm ${
                stats.critical_equipment > 0
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {stats.critical_equipment > 0 ? '⚠️ Attention needed' : '✅ All good'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Technicians Active</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {stats.technician_load.length} working
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-gray-500 text-center py-8">
          <p>Recent maintenance activities will appear here</p>
          <p className="text-sm mt-2">Complete the full implementation to see activity feed</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;