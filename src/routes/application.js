const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

// Define the /username route
router.get('/application', userController.getApplication);

module.exports = router;