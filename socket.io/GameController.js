const EVENT_NAMES = require('../config/SocketIO.Cfg');
const ListOnlineUser = require('./ListOnlineUserManager');
const SocketManager = require('./SocketManager');
const ResultIdentification = require('../utils/ResultIdentification');
const BoardM = require('../models/Board.M');
const Board_Cfg = require('../config/Board.Cfg');
const AccountM = require('../models/Account.M');
const HistoryGameM = require('../models/HistoryGame.M');
const BoardMangager = require('./BoardMangager');

const SIZE =20;
const LIMIT_TIME = 10;
class GameController
{
    constructor(io,boardID, player1ID, player2ID) {
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
        console.log(`Move ${index}`);
        //set Time clock
        // clearInterval(this.stopWatch);
        // clearInterval(this.updateWatch);
    
        // this.stopWatch = null;
        // this.updateWatch = null;

        this.board[index] = this.stepNumber % 2 === 0 ? "X" : "O";
        //const playerNextTurn = this.stepNumber % 2 === 0 ? this.player1ID : this.player2ID;
        //emit to another socket 
        this.io.to(this.boardID).emit(EVENT_NAMES.STEP_TO_CLIENT, {
            board: this.board,  
            index,
            stepNumber: this.stepNumber +1,
            playerInfo: this.board[index],
          });
        //save history
      
        try {
            const history = await HistoryGameM.findOne({boardID: this.boardID});
            history.history.push({
                index: index,
                player: this.stepNumber %2 ===0? 1 : 2,
            })
            //console.log(history.history);
            await history.save();
        } catch (error) {
            console.log(error);
        }

        const result = ResultIdentification.calculateWinner(this.board,index,20,5);
        if (result)
        {
            if(result.msg === "Draw")
            {
                this.sendDrawResult();
                return;
            }
            else{
                console.log(this.stepNumber %2===0? this.player1ID: this.player2ID);
                const winner = this.stepNumber %2===0? this.player1ID: this.player2ID;
                this.sendWinResult(result.line, winner);
                return;
            }
        }

        this.io.to(this.boardID).emit(EVENT_NAMES.RESPONSE_CURRENT_PLAYER, {stepNumber: this.stepNumber +1});
      
        //   const { gameover, winner } = this.checkWin(index);
      
        //   if (gameover) {
        //     this.sendNotifyWin(winner);
        //     return;
        //   }
      
        //   this.orderTurn++;
        //   this.time = this.limitTime;
      
        //   const playerNextTurn =
        //     this.orderTurn % 2 === 0 ? this.playerX : this.playerO;
      
        //   this.io
        //     .to(this.idRoom)
        //     .emit(SOCKET_TAG.RESPONSE_TIMMER, { time: this.limitTime });
      
        //   this.io
        //     .to(this.idRoom)
        //     .emit(SOCKET_TAG.RESPONSE_PLAYER_NEXT_TURN, { player: playerNextTurn });
      
        //   this.timmerInterval = setInterval(
        //     () => this.timeUp(),
        //     this.limitTime * 1000
        //   );
        //   this.updateTimeInterval = setInterval(() => this.updateTimmer(), 1000);
        this.stepNumber++;
    }

    async startGame(){

        // this.io
        // .to(this.idRoom)
        // .emit(SOCKET_TAG.RESPONSE_TIMMER, { time: this.limitTime });
        // this.timmerInterval = setInterval(
        // () => this.timeUp(),
        // this.limitTime * 1000
        // );
        // this.updateTimeInterval = setInterval(() => this.updateTimmer(), 1000);

        console.log({owner: this.player1socketID,player: this.player2socketID, boardID: this.boardID})
        try {
            const result = BoardM.findByIdAndUpdate({_id: this.boardID},
                {
                    boardStatus: Board_Cfg.INGAME_STATUS,
                })

            await HistoryGameM.findOneAndUpdate({boardID: this.boardID},
            {
                playerID: this.player2ID
            });

            const player1 = await AccountM.findById({_id: this.player1ID});
            const player2 = await AccountM.findById({_id: this.player2ID});

            player1.matches.push(this.boardID);
            player2.matches.push(this.boardID);

            await player1.save();
            await player2.save();
            player1
        } catch (error) {
            console.log(error);
        }
        console.log("START GAME CONTROLLER");
        this.io.to(this.boardID).emit(EVENT_NAMES.START_GAME, {
            stepNumber: this.stepNumber,
          });
        
        this.io.to(this.boardID).emit(EVENT_NAMES.RESPONSE_STATUS, {
            status: Board_Cfg.INGAME_STATUS,
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

    async sendDrawResult() {
        // clearInterval(this.timmerInterval);
        // clearInterval(this.updateTimeInterval);
    
        // this.timmerInterval = null;
        // this.updateTimmerInterval = null;
    
        this.io.to(this.boardID).emit(EVENT_NAMES.RESPONSE_WINNER, { winner: null });
        //this.stopGame();
      }

    async sendWinResult(winningLine, winner)
    {
        console.log("WINNER: ",winner);
        this.io.to(this.boardID).emit(EVENT_NAMES.RESPONSE_WINNER, { line: winningLine, winner: winner });
        try {
            const board = await BoardM.findByIdAndUpdate({_id: this.boardID},{
                boardStatus: Board_Cfg.INRESULT_STATUS,
            });

            const history = await HistoryGameM.findOneAndUpdate({boardID: this.boardID},{
                winningLine: winningLine,
            });

            const player1 = await AccountM.findOne({_id: this.player1ID});
            const player2 = await AccountM.findOne({_id: this.player2ID});
            
            if (this.player1ID === winner)
            {
                player1.elo =  player1.elo + history.eloGot;
                player2.elo = player2.elo - history.eloGot;
                player1.winningGame.push(this.boardID);
                player2.lostGame.push(this.boardID);
            }
            else{
                player2.elo = player2.elo + history.eloGot;
                player1.elo = player1.elo - history.eloGot;
                player2.winningGame.push(this.boardID);
                player1.lostGame.push(this.boardID);
            }
            console.log({player1, player2});
            await player1.save();
            await player2.save();
        } catch (error) {
            console.log(error);
        }
    }
    reConnect(socketID, userID)
    {
        console.log(`${socketID} RECONNECT BOARD`);

        this.io.to(socketID).emit(EVENT_NAMES.RESPONSE_RECONNECT, {
            board: this.board,
            //playerX: this.playerX,
            stepNumber: this.stepNumber,
          });

        this.io.to(socketID).emit(EVENT_NAMES.RESPONSE_STATUS, {
            status: Board_Cfg.INGAME_STATUS,
        });

        // const userID = //ListOnlineUser.getUserIDBySocketID(socketID);
        //     AccountM.findById({_id: this.player1ID}).select({})
        console.log(userID);
        if (userID === this.player1ID || userID === this.player2ID) {

        SocketManager.setSocketOn(
            socketID,
            EVENT_NAMES.STEP_FROM_CLIENT,
            ({ index }) => this.handleMove(index)
        );
        }
    }

    // stopGame(){
       

    //     SocketManager.removeSocketOn(
    //         this.player1SocketID,
    //         EVENT_NAMES.STEP_TO_CLIENT
    //         );
    //     SocketManager.removeSocketOn(
    //         this.player2SocketID,
    //         EVENT_NAMES.STEP_TO_CLIENT
    //         )    
    // }
}

module.exports = GameController;