const express = require('express');
const UserController = require('../controllers/User.C');
const router = express.Router();

router.post('/list-friend', UserController.getListFriend);

router.post('/send-friend-invitation', UserController.sendMakingFriendRequest);

router.post('/on-processing-friend-invitation', UserController.processingFriendInvitation);

router.post('/unfriend', UserController.unFriend);

module.exports = router;