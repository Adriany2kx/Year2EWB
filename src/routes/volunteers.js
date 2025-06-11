const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

// Define the /username route
router.get('/volunteer', userController.getVolunteer);

module.exports = router;