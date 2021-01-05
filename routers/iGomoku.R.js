const express = require('express');
const iGomokuController = require('../controllers/iGomoku.C');
const router = express.Router();

router.get('/', iGomokuController.getHomePageInfo);


module.exports = router;