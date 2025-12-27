# GearGuard Maintenance System

A comprehensive maintenance management system built with Node.js, Express, PostgreSQL, and React.

## Features

- **User Authentication**: Secure login and signup with JWT tokens
- **Dynamic Dashboard**: Real-time statistics and maintenance request overview
- **Maintenance Request Management**: Create, track, and manage maintenance requests
- **Equipment Management**: Monitor equipment health and maintenance schedules
- **Work Center Management**: Organize maintenance operations by work centers
- **Search & Filter**: Advanced search functionality for maintenance requests
- **Status Tracking**: Real-time status updates for maintenance requests

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt Password Hashing

### Frontend
- React
- Vite
- Tailwind CSS
- Axios for API calls

## Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yug0911/ODOO-X-Adani-University-Hackathon.git
   cd ODOO-X-Adani-University-Hackathon
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Database Setup**
   - Create a PostgreSQL database named `maintenance`
   - Update `.env` file with your database credentials
   - Run the database setup script:
   ```bash
   node setup.js
   ```

5. **Environment Configuration**
   Copy `.env.example` to `.env` and update the values:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=maintenance
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   npm run dev
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:3000

### Production Mode

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Maintenance Requests
- `GET /api/maintenance-requests` - Get all requests
- `POST /api/maintenance-requests` - Create new request
- `PATCH /api/maintenance-requests/:id/status` - Update request status

### Equipment
- `GET /api/equipment` - Get all equipment

### Work Centers
- `GET /api/work-centers` - Get all work centers

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts
- `companies` - Company information
- `equipment` - Equipment inventory
- `maintenance_requests` - Maintenance request records
- `work_centers` - Work center definitions

## Default Login Credentials

- **Email**: admin@gearguard.com
- **Password**: password

- **Email**: john@gearguard.com
- **Password**: password

## Project Structure

```
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── context/         # React context
├── src/                     # Node.js backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   └── utils/               # Utility functions
├── schema.sql               # Database schema
├── setup.js                 # Database setup script
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the GitHub repository.