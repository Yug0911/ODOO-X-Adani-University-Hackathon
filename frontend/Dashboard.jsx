import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    critical_equipment: 0,
    technician_load: [],
    open_requests: 0
  });

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Critical Equipment Card */}
      <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold">Critical Equipment</h2>
        <p className="text-4xl mt-4">{stats.critical_equipment}</p>
        <p>Machines at risk</p>
      </div>

      {/* Technician Workload Card */}
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold">Technician Workload</h2>
        <ul className="mt-4">
          {stats.technician_load.map((tech, index) => (
            <li key={index} className="flex justify-between">
              <span>{tech.name}</span>
              <span>{tech.task_count} tasks</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Open Requests Card */}
      <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold">Open Requests</h2>
        <p className="text-4xl mt-4">{stats.open_requests}</p>
        <p>Pending maintenance</p>
      </div>
    </div>
  );
};

export default Dashboard;