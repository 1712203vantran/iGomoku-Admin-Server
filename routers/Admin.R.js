const express = require('express');
const AdminController = require('../controllers/Admin.C');
const router = express.Router();
const AuthUtils = require("../utils/Auth.Utils");

router.get('/list-user', AdminController.getListUser);

router.post('/set-user-status', AdminController.settingUserAccessing);

router.get('/user-profile', AdminController.getUserProfile);

//router.get('/list-history', AuthUtils.authenticateJWT, AdminController.getListHistory);
router.get('/list-history', AdminController.getListHistory);

router.get('/list-friend', AdminController.getListFriend);

router.get('/history', AdminController.getHistory);

module.exports = router;