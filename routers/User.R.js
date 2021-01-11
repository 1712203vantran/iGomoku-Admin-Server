const express = require('express');
const UserController = require('../controllers/User.C');
const router = express.Router();
const AuthUtils = require("../utils/Auth.Utils");

router.get('/list-payment', AuthUtils.authenticateJWT, UserController.getListPayment);

router.get('/list-friend', AuthUtils.authenticateJWT,UserController.getListFriend);

router.get('/list-history',AuthUtils.authenticateJWT, UserController.getListHistory);

router.get('/list-friend-invitation', AuthUtils.authenticateJWT, UserController.getListFriendInvitation);

router.get('/history',AuthUtils.authenticateJWT, UserController.getHistory);

router.post('/send-friend-invitation',AuthUtils.authenticateJWT, UserController.sendMakingFriendRequest);

router.post('/on-processing-friend-invitation',AuthUtils.authenticateJWT, UserController.processingFriendInvitation);

router.post('/unfriend',AuthUtils.authenticateJWT, UserController.unFriend);

module.exports = router;