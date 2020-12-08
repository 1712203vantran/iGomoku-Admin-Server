const express = require('express');
const iGomokuController = require('../controllers/iGomoku.C');
const router = express.Router();

router.get('/user-list', iGomokuController.getListOnlineUser);


module.exports = router;