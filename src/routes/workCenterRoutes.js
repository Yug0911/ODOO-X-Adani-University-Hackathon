const express = require('express');
const router = express.Router();
const { getAllWorkCenters } = require('../controllers/workCenterController');

router.get('/', getAllWorkCenters);

module.exports = router;