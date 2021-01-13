const EVENT_NAMES = require('../config/SocketIO.Cfg');
const {io} = require('./index');
const ListOnlineUser = require('./ListOnlineUserManager');
const SocketManager = require('./SocketManager');

const SIZE =20;
const LIMIT_TIME = 10;
class GameController
{
    constructor(boardID, player1ID, player2ID) {
        this.boardID = boardID;
        this.player1ID = player1ID;
        this.player2ID = player2ID;
        this.io = io;
        this.size = SIZE;
        this.limitTime =LIMIT_TIME;
        this.player1socketID = ListOnlineUser.getSocketIDByuserID(player1ID);
        this.player2socketID = ListOnlineUser.getSocketIDByuserID(player2ID);

        this.board = Array(SIZE*SIZE).fill(null);
        this.stepNumber= 0;
        this.stopWatch = null;
        this.updateWatch = null;
    }

    async handleMove(index){

    }

    startGame(){

        // this.io
        // .to(this.boardID)
        // .emit(SOCKET_TAG.RESPONSE_TIMMER, { time: LIMIT_TIME });
        // this.timmerInterval = setInterval(() => this.timeUp(), LIMIT_TIME * 1000);
        // this.updateTimeInterval = setInterval(() => this.updateTimmer(), 1000);

        this.io.to(this.boardID).emit(EVENT_NAMES.START_GAME, {
            currentPlayer: this.stepNumber%2===0?this.player1ID:this.player2ID,
          });

        SocketManager.setSocketOn(this.player1socketID,
                EVENT_NAMES.STEP_FROM_CLIENT,
                ({index}) => this.handleMove(index)
        );

        SocketManager.setSocketOn(this.player2socketID,
            EVENT_NAMES.STEP_FROM_CLIENT,
            ({index}) => this.handleMove(index)
        );
    }

}

module.exports = GameController;