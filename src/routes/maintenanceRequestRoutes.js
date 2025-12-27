const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getKanbanRequests,
  getCalendarRequests,
  createRequest,
  updateRequestStatus
} = require('../controllers/maintenanceRequestController');
const { validateMaintenanceRequest } = require('../middleware/validateRequest');

router.get('/', getAllRequests);
router.get('/kanban', getKanbanRequests);
router.get('/calendar', getCalendarRequests);
router.post('/', validateMaintenanceRequest, createRequest);
router.patch('/:id/status', updateRequestStatus);

module.exports = router;