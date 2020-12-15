const express = require('express');
const BoardController = require('../controllers/Board.C');
const router = express.Router();

router.post('/create-board', BoardController.createBoard);

router.post('/delete-board', BoardController.deleteBoard);

router.post('/find-by-id', BoardController.findBoardById);

router.post('/find-by-name', BoardController.findBoardByName);

router.post('/on-join', BoardController.playerJoinBoard);

router.post('/on-leave', BoardController.playerLeaveBoard);

module.exports = router;