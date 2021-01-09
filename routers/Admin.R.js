const express = require('express');
const AdminController = require('../controllers/Admin.C');
const router = express.Router();

router.get('/list-user', AdminController.getListUser);

router.post('/set-user-status', AdminController.settingUserAccessing);

router.get('/user-profile', AdminController.getUserProfile);

module.exports = router;