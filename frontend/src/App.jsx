import { useState, useEffect } from 'react'
import SignUpPage from './pages/SignUpPage'
import NewMaintenancePage from './pages/NewMaintenancePage'
import RequestForm from '../RequestForm'
import api from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('login')
  const [maintenanceRequests, setMaintenanceRequests] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    critical_equipment: 0,
    technician_load: [],
    open_requests: 0
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
      setCurrentView('dashboard')
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchMaintenanceRequests()
    }
  }, [isAuthenticated])

  const fetchMaintenanceRequests = async () => {
    try {
      const [requestsRes, statsRes] = await Promise.all([
        api.get('/maintenance-requests'),
        api.get('/dashboard/stats')
      ])

      if (requestsRes.data.success) {
        setMaintenanceRequests(requestsRes.data.data)
      }

      if (statsRes.data) {
        setDashboardStats(statsRes.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    setCurrentView('login')
  }

  const showSignUp = () => setCurrentView('signup')
  const showLogin = () => setCurrentView('login')

  if (!isAuthenticated) {
    if (currentView === 'signup') {
      return <SignUpPage onSwitchToLogin={showLogin} />
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to GearGuard
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Maintenance Management System
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={async (e) => {
            e.preventDefault()
            try {
              // Call backend login API
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: e.target.email.value,
                  password: e.target.password.value
                })
              })

              if (response.ok) {
                const data = await response.json()
                localStorage.setItem('token', data.data.token)
                localStorage.setItem('user', JSON.stringify(data.data.user))
                handleLogin(data.data.user)
              } else {
                const error = await response.json()
                alert(error.message || 'Login failed')
              }
            } catch (error) {
              alert('Network error. Please check if backend is running.')
            }
          }}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">Don't have an account? </span>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                onClick={showSignUp}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch(currentView) {
      case 'dashboard':
        return (
          <div className="p-6">
            <div className="mb-6 flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('new-maintenance')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                NEW
              </button>
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search maintenance requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold">Critical Equipment</h2>
                <p className="text-4xl mt-4">{dashboardStats.critical_equipment}</p>
                <p>Machines at risk (health less than 30%)</p>
              </div>
              <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold">Technician Workload</h2>
                <ul className="mt-4">
                  {dashboardStats.technician_load.slice(0, 3).map((tech, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{tech.name}</span>
                      <span>{tech.active_tasks} tasks</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold">Open Requests</h2>
                <p className="text-4xl mt-4">{dashboardStats.open_requests}</p>
                <p>Pending maintenance tasks</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Recent Maintenance Requests</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Technician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {maintenanceRequests
                      .filter(request =>
                        request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (request.assigned_technician_name && request.assigned_technician_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        request.status.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((request, index) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.created_by_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.assigned_technician_name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.category_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.status === 'New Request' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'Repaired' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Default Company
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Equipment Management</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">Equipment List</h2>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[
                    { id: 1, name: 'Samsung Monitor 24"', serial: 'SN-000001', health: 98 },
                    { id: 2, name: 'Dell Precision Workstation', serial: 'SN-000002', health: 95 },
                    { id: 3, name: 'Hydraulic Press X1', serial: 'SN-000003', health: 88 },
                    { id: 4, name: 'Old Conveyor Belt', serial: 'SN-000004', health: 25 }
                  ].map((equip) => (
                    <div key={equip.id} className="p-4 border-b cursor-pointer hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{equip.name}</h3>
                          <p className="text-sm text-gray-600">Serial: {equip.serial}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          equip.health >= 70 ? 'bg-green-100 text-green-800' :
                          equip.health >= 30 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {equip.health}% Health
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p>Select an equipment item to view details</p>
                <p className="text-sm mt-2">Smart button functionality available</p>
              </div>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Maintenance Requests</h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                🚧 <strong>Dynamic Kanban Board</strong> - In production, this connects to your backend API for real-time maintenance request management with drag & drop functionality, status transitions, and overdue detection.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['New Request', 'In Progress', 'Repaired', 'Scrap'].map((status) => (
                <div key={status} className="bg-gray-100 p-4 rounded-lg min-h-96">
                  <h3 className="text-lg font-bold mb-4">{status} ({Math.floor(Math.random() * 5)})</h3>
                  <div className="space-y-2">
                    {Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => (
                      <div key={i} className={`bg-white p-3 rounded shadow border-l-4 ${
                        Math.random() > 0.8 ? 'border-red-500 bg-red-50' : 'border-blue-500'
                      }`}>
                        <h4 className="font-bold text-sm">Sample Request {i + 1}</h4>
                        <p className="text-xs text-gray-600">Equipment Name</p>
                        <p className="text-xs">Team: Maintenance</p>
                        {Math.random() > 0.8 && (
                          <span className="inline-block mt-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Maintenance Calendar</h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                📅 <strong>Dynamic Calendar</strong> - Shows preventive maintenance requests with color-coded status. Click dates to schedule new maintenance.
              </p>
            </div>
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
              <div className="text-center py-12 text-gray-500">
                <p>📅 Calendar view with preventive maintenance events</p>
                <p className="text-sm mt-2">Click dates to schedule new maintenance requests</p>
              </div>
            </div>
          </div>
        );

      case 'workcenters':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Work Centers</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Work Center Management</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Work Center
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OEE Target
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost/hr
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { name: 'Assembly Line 1', code: 'WC-ASM-01', capacity: 5, oee: 95, cost: 150 },
                      { name: 'Drill Station Alpha', code: 'WC-DRL-A', capacity: 1, oee: 85, cost: 45 },
                      { name: 'Testing Lab', code: 'WC-TST-01', capacity: 1, oee: 99, cost: 500 }
                    ].map((wc, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {wc.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {wc.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {wc.capacity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            wc.oee >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {wc.oee}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${wc.cost}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'reporting':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Reporting</h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                📊 <strong>Reporting Dashboard</strong> - In production, this will display maintenance reports, equipment health analytics, and performance metrics with charts and exportable data.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Maintenance Reports</h2>
                <p className="text-gray-600">View detailed maintenance request reports</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Equipment Analytics</h2>
                <p className="text-gray-600">Health trends and failure predictions</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
                <p className="text-gray-600">OEE, downtime, and efficiency reports</p>
              </div>
            </div>
          </div>
        );

      case 'teams':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Teams</h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                👥 <strong>Team Management</strong> - Manage technicians, assign roles, and track team performance. Connects to backend for user management and team assignments.
              </p>
            </div>
            <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Team Members</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { name: 'John Technician', email: 'john@gearguard.com', role: 'Technician', status: 'Active' },
                      { name: 'Admin User', email: 'admin@gearguard.com', role: 'Admin', status: 'Active' }
                    ].map((member, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'new-maintenance':
        return <NewMaintenancePage />;

      default:
        return <div className="p-6"><h1>Welcome to GearGuard</h1></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold mr-12">GearGuard</h1>
          <div className="flex justify-between items-center w-full">
            <div className="space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`hover:underline ${currentView === 'dashboard' ? 'font-bold' : ''}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`hover:underline ${currentView === 'calendar' ? 'font-bold' : ''}`}
              >
                Maintenance Calendar
              </button>
              <button
                onClick={() => setCurrentView('equipment')}
                className={`hover:underline ${currentView === 'equipment' ? 'font-bold' : ''}`}
              >
                Equipment
              </button>
              <button
                onClick={() => setCurrentView('reporting')}
                className={`hover:underline ${currentView === 'reporting' ? 'font-bold' : ''}`}
              >
                Reporting
              </button>
              <button
                onClick={() => setCurrentView('teams')}
                className={`hover:underline ${currentView === 'teams' ? 'font-bold' : ''}`}
              >
                Teams
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        {renderContent()}
      </main>
    </div>
  )
}

export default App