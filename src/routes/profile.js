const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

// Importing JSON files to access page content
const profile = require('../json/english/profile.json');

router.get('/', userController.getProfile);
router.post('/update', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.post('/notifications', userController.updateNotifications);
router.post('/language', userController.updateLanguage);

module.exports = router;