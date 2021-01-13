const express = require('express');
const UserController = require('../controllers/User.C');
const router = express.Router();

router.get('/list-payment', UserController.getListPayment);

router.get('/list-friend', UserController.getListFriend);

router.get('/bxh', UserController.getBXH);


router.get('/list-history', UserController.getListHistory);

router.get('/list-friend-invitation', UserController.getListFriendInvitation);

router.get('/history', UserController.getHistory);

router.post('/send-friend-invitation', UserController.sendMakingFriendRequest);

router.post('/on-processing-friend-invitation', UserController.processingFriendInvitation);

router.post('/unfriend', UserController.unFriend);

module.exports = router;