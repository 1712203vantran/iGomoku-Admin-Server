const BoardConstants = require('../config/Board.Cfg');
const GameController = require('./GameController');

let boardList = [];

const BoardManager = {
    joinBoard: (socketID, boardID) =>{
        //if exist board (define by boardID)
        for(let i =0; i< boardList.length;i++)
        {
            if (boardList[i].boardID === boardID)
            {
                //reconnect && player join board
                if(boardList[i].player1socketID !== socketID && boardList[i].player2socketID ===null)
                {
                    boardList[i].player2socketID = socketID;
                }
                return;
            }
        };

        boardList.push({
            boardID,
            player1socketID: socketID,
            player2socketID: null,
            status: BoardConstants.WATING_STATUS,
            gameController: null,
        })
    },

    push: (socketID, newBoard) =>{
        boardList.push({
            ownerSocketID: socketID,
            player: newBoard.player,
            boardStatus: newBoard.boardStatus,
            controllerGame: null,
        });
    },
    
    startGame: (boardID) =>{
        for(let i =0; i< boardList.length;i++)
        {
            if (boardList[i].boardID === boardID)
            {
                boardList[i].status = BoardConstants.INGAME_STATUS;
                boardList[i].gameController = new GameController(boardID, player1ID, player2ID);
                
            }
        }
    }
}

module.exports = BoardManager;