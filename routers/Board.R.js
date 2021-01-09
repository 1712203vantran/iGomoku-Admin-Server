const express = require('express');
const BoardController = require('../controllers/Board.C');
const router = express.Router();
const AuthUtils = require('../utils/Auth.Utils');

router.post('/create',AuthUtils.authenticateJWT, BoardController.createBoard);

router.post('/delete', AuthUtils.authenticateJWT, BoardController.deleteBoard);

router.post('/find-by-id', BoardController.findBoardById);

router.post('/find-by-name', BoardController.findBoardByName);

router.post('/on-join', AuthUtils.authenticateJWT, BoardController.playerJoinBoard);

router.post('/on-leave', AuthUtils.authenticateJWT, BoardController.playerLeaveBoard);

//router.get('/list', BoardController.getListBoard);

router.get('/:boardID',AuthUtils.authenticateJWT, BoardController.getInfoOfTwoPlayer);

router.post('/save-history',AuthUtils.authenticateJWT, BoardController.saveHistoryGame);


module.exports = router;