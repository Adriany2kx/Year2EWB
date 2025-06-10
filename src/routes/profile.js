const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

router.get('/', userController.getProfile);
router.post('/update', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.post('/notifications', userController.updateNotifications);
router.post('/language', userController.updateLanguage);

module.exports = router;