const BoardConstants = require('../config/Board.Cfg');
const GameController = require('./GameController');
const ListOnlineUser = require('./ListOnlineUserManager');

let boardList = [];

const BoardManager = {
    joinBoard: (socketID, boardID) =>{
        
        //if exist board (define by boardID)
        //const userID = ListOnlineUser.getUserIDBySocketID(socketID);
        for(let i =0; i< boardList.length;i++)
        {
            if (boardList[i].boardID === socketID)
            {
                //reconnect && player join board
                if(boardList[i].player1SocketID !== socketID && boardList[i].player2SocketID === null)
                {
                    boardList[i].player2SocketID = socketID;
                }
                return;
            }
        };
        boardList.push({
            boardID: boardID,
            player1SocketID: socketID,
            player2SocketID: null,
            status: BoardConstants.WATING_STATUS,
            gameController: null,
        })
    },

    push: (newBoard) =>{
        boardList.push({
            ownerID: newBoard.owner._id,
            player: newBoard.player,
            boardStatus: newBoard.boardStatus,
            controllerGame: null,
        });
    },
    
    startGame: (boardID) =>{
        let firstMove = "";
        for(let i =0; i< boardList.length;i++)
        {
            if (boardList[i].boardID === boardID)
            {
                if (boardList[i].status !== BoardConstants.INGAME_STATUS)
                {
                    boardList[i].status = BoardConstants.INGAME_STATUS;
                    boardList[i].gameController = new GameController(boardID, boardList[i].player1SocketID, boardList[i].player2SocketID);
                
                    boardList[i].gameController.startGame();
                    firstMove = boardList[i].player1SocketID;
                    console.log(firstMove);
                    break;
                }
                else{
                    
                }
            }
        }
        return firstMove;
    }
}

module.exports = BoardManager;