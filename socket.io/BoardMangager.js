const BoardConstants = require('../config/Board.Cfg');
const GameController = require('./GameController');
const ListOnlineUser = require('./ListOnlineUserManager');

//let boardList = [];

class BoardManager
 {
     constructor() {
         this.boardList = [];
         this.io=null;
     }
    setIo(io){
        this.io = io;
    };

    joinBoard(socketID, boardID){
        //if exist board (define by boardID)
        const userID = ListOnlineUser.getUserIDBySocketID(socketID);
        for(let i =0; i< this.boardList.length;i++)
        {
            //const { player1SocketID, player2SocketID } = this.boardList[i];
            if (this.boardList[i].boardID === boardID)
            {
                if(this.boardList[i].gameController !== null)
                {
                    this.boardList[i].gameController.reConnect(socketID);
                }

                if(this.boardList[i].player1SocketID !== socketID && this.boardList[i].player2SocketID === null)
                {
                    console.log("player join board ", socketID);
                    this.boardList[i].player2SocketID = socketID;
                    this.boardList[i].playerID = userID;
                }

                else if (this.boardList[i].player1SocketID === null) {
                    // update player1
                    this.boardList[i].player1SocketID = socketID;
                }
                return;
            }
        };
        this.boardList.push({
            ownerID: userID,
            playerID: null,
            boardID: boardID,
            player1SocketID: socketID,
            player2SocketID: null,
            status: BoardConstants.WATING_STATUS,
            gameController: null,
        })
    };

    leaveBoard(socketID){

        for(let i =0; i< this.boardList.length;i++)
        {
            const {player1SocketID, player2SocketID} = this.boardList[i];
            if (player1SocketID === socketID)
            {
                this.boardList[i].player1SocketID = null;
            }
            else if (player2SocketID === socketID)
            {
                this.boardList[i].player2SocketID = null;
            }

            if (this.boardList[i].player1SocketID || this.boardList[i].player2SocketID)
            {

            }
        }
    };
    
    startGame(boardID){
        for(let i =0; i< this.boardList.length;i++)
        {
            if (this.boardList[i].boardID === boardID)
            {
                if (this.boardList[i].status !== BoardConstants.INGAME_STATUS)
                {
                    this.boardList[i].status = BoardConstants.INGAME_STATUS;
                    this.boardList[i].gameController = new GameController(this.io, 
                        boardID, 
                        this.boardList[i].ownerID,
                        this.boardList[i].playerID
                        );
                
                    this.boardList[i].gameController.startGame();
                    break;
                }
            }
        }
    };

    getBoardByID(boardID){
        for(let i =0; i<this.boardList.length; i++)
        {
            if (this.boardList[i].boardID === boardID)
            {
                return this.boardList[i];
            }
        }
        return null;
    }
}

module.exports = new BoardManager();