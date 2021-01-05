const express = require('express');
const BoardController = require('../controllers/Board.C');
const router = express.Router();

router.post('/create', BoardController.createBoard);

router.post('/delete', BoardController.deleteBoard);

router.post('/find-by-id', BoardController.findBoardById);

router.post('/find-by-name', BoardController.findBoardByName);

router.post('/on-join', BoardController.playerJoinBoard);

router.post('/on-leave', BoardController.playerLeaveBoard);

//router.get('/list', BoardController.getListBoard);

router.get('/:boardID', BoardController.getInfoOfTwoPlayer);

router.post('/save-history', BoardController.saveHistoryGame);


module.exports = router;