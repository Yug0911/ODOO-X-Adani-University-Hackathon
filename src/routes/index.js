const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const maintenanceRequestRoutes = require('./maintenanceRequestRoutes');
const equipmentRoutes = require('./equipmentRoutes');
const workCenterRoutes = require('./workCenterRoutes');

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/maintenance-requests', maintenanceRequestRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/work-centers', workCenterRoutes);

module.exports = router;