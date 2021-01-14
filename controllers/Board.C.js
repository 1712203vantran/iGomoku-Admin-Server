const Board = require('../models/Board.M');
const Utils = require('../utils/Utils');
const StatusConstant = require('../config/StatusResponseConfig');
const BoardConstants = require('../config/Board.Cfg');
const {realTimeActions} = require('../socket.io');
const History = require('../models/HistoryGame.M');

/*
    CREATE BOARD
    - userId: string
    - boardName: string
 */
module.exports.createBoard = async function (req, res, next) {
    const {userID,// user create board (owner)
    boardName,
    isPrivate,
    password,
    player,
    ownerName,
    socketID } = req.body;
    const boardInfo = {
        owner: userID,
        boardName: boardName,
        boardStatus: !isPrivate && player?BoardConstants.INGAME_STATUS : BoardConstants.WATING_STATUS, //watting
        isPrivate:isPrivate,
        password: password,
    }
    if (typeof player!== "undefined")
    {
        boardInfo.player = player._id;
    }

    const createdBoard = new Board(boardInfo);
    
    try {
        const savedBoard = await createdBoard.save();
        console.log(`[CreateNewBoard] - By ${userID} - Board: ${savedBoard._id}`);

        const history = new History({
            ownerID: userID,
            boardID: savedBoard._id,
            eloGot: BoardConstants.DEFAULT_ELO,
            boardStatus: BoardConstants.CREATE_STATUS
        })

        const createdHistory = await history.save();
        //realtime invite for player
        realTimeActions.updateBoardActiveList(socketID, {
            owner: {
                fullname: ownerName,
                _id: userID
            },
            boardName: savedBoard.boardName,
            watchers:  savedBoard.watchers,
            _id: savedBoard._id,
            boardStatus: savedBoard.boardStatus,
            isPrivate: savedBoard.isPrivate,
            player: player?player:null,
        });
        savedBoard.role = BoardConstants.OWNER_ROLE;
        if (typeof player!== "undefined")
        {
            realTimeActions.sendInviteToPlayer(savedBoard._id, {
                fullname: ownerName,
                socketID: player.socketID,
                _id: player._id,
            });
        }
        return res.status(StatusConstant.Ok).send(savedBoard);
    } catch (error) {
        res.status(StatusConstant.Error).send({ message: error });
        console.log(`[CreateNewBoard] - By ${userID} - Error: ${error}`);
    }
};

/*
    DELETE BOARD
    - boardId: string
 */
module.exports.deleteBoard = async function (req, res, next) {
    const boardID = req.body.boardID;

    // delete board
    try {
        const removedBoard = await Board.remove({ _id: boardID });
        res.status(StatusConstant.Ok).send(removedBoard);
        console.log(`[DeleteBoard] - BoardID ${boardID} - Board ${board}`);
    } catch (error) {
        res.status(StatusConstant.Error).send({message: error});
        console.log(`[DeleteBoard] - BoardID ${boardID} - Error ${error}`);
    }
};

/*
    FIND BOARD BY ID
    - boardId: string
 */
module.exports.findBoardById = async function (req, res, next) {
    const boardId = req.body.boardId;

    // find board by id
    try {
        const board = await Board.findById(boardId);
        res.status(StatusConstant.Ok).send(board);
        console.log(`[FindBoardByID] - BoardID ${boardId} - Board ${board}`);
    } catch (error) {
        res.status(StatusConstant.Error).send({message: error});
        console.log(`[FindBoardByID] - BoardID ${boardId} - Error ${error}`);
    }
};


/*
    FIND BOARD BY NAME
    - boardName: string
 */
module.exports.findBoardByName = async function (req, res, next) {
    const boardName = req.body.boardName;

    // find board by id
    try {
        const board = await Board.findOne({boardName: boardName});
        res.status(StatusConstant.Ok).send(board);
        console.log(`[FindBoardByName] - BoardName ${boardName} - Board ${board}`);
    } catch (error) {
        res.status(StatusConstant.Error).send({message: error});
        console.log(`[FindBoardByName] - Error ${boardName} - Error ${error}`);
    }
};

/*
    ON JOIN BOARD
    - USER Id: string
    - Board Id: String
 */
module.exports.playerJoinBoard = async function (req, res, next) {
    const playerID = req.body.userID;
    const boardID = req.body.boardID;
    try {
        //get board 's infomation
        const boardInfo = await Board.findById({_id: boardID}).exec();
        //check if player null => second person is player else become watcher
        if (boardInfo && !boardInfo.owner.equals(playerID)) 
        {
            if (boardInfo.player === null || boardInfo.player.equals(playerID))
            {
                const joinBoard = await Board.findOneAndUpdate(
                    {_id: boardID},
                    { $set: 
                        {
                            player: playerID,
                            //boardStatus: boardInfo.isPrivate? BoardConstants.WATING_STATUS: BoardConstants.INGAME_STATUS,
                        }
                    },
                    {new: true},
                );
                joinBoard.role = BoardConstants.PLAYER_ROLE;
                //update historyinfo
                // await History.findOneAndUpdate({boardID: boardID},
                //     {
                //         playerID: playerID
                //     },
                //     {new: true},
                //     );
                //create history game whe use join board 
                console.log(`[PlayerJoinBoard] - BoardId ${boardID} - PlayerId ${playerID}`);
                realTimeActions.notifyUser(boardID, playerID, boardInfo.owner.toString());
                return res.status(StatusConstant.Ok).send(joinBoard);
            }  
            else      //update watcher list 
            {
                const watchers = Array.from(boardInfo.watchers);
                watchers.push(playerID);
                const joinBoard = await Board.findOneAndUpdate(
                    {_id: boardID},
                    {
                        watchers: watchers
                    },
                    {new: true},
                );
                joinBoard.role = BoardConstants.WATCHER_ROLE;
                console.log(`[WatcherJoinBoard] - BoardId ${boardID} - PlayerId ${playerID}`);
                realTimeActions.notifyUser(boardID, playerID, boardInfo.owner.toString());
                return res.status(StatusConstant.Ok).send(joinBoard);
        }
        }
    }catch(error) {
        res.status(StatusConstant.Error).send({message: error});
        console.log(`[PlayerJoinBoard] - Error: ${error}`);
    }
};

/*
    ON LEAVE BOARD
    - USER Id: string
    - Board Id: String
 */
module.exports.playerLeaveBoard = async function (req, res, next) {
    const playerId = req.body.userId;
    const boardId = req.body.boardId;

    const board = await Board.findById(boardId);

    // if board is exist
    if(board){
        // player leave
        if(playerId === board.player){
            try {
                const leaveBoard = await Board.updateOne(
                    {_id: boardId},
                    { $set: 
                        {
                            player: null,
                        }
                    }
                );
                res.status(StatusConstant.Ok).send(leaveBoard);
                console.log("[OnPlayerLeaveBoard] - Player Leave Board: " + leaveBoard);
            }catch(error) {
                res.status(StatusConstant.Error).send({message: error});
                console.log("[OnPlayerLeaveBoard] - Player Leave Board - Error: " + error);
            }
        }
        // owner leave
        else if(playerId === board.owner){
            try {
                const leaveBoard = await Board.updateOne(
                    {_id: boardId},
                    { $set: 
                        {
                            owner: board.player,
                            player: null
                        }
                    }
                );
                console.log("[OnPlayerLeaveBoard] - Owner Leave Board: " + leaveBoard);
                res.status(StatusConstant.Ok).send(leaveBoard);
            }catch(error) {
                console.log("[OnPlayerLeaveBoard] - Owner Leave Board - Error: " + error);
                res.status(StatusConstant.Error).send({message: error});
            }

            if(leaveBoard.owner === null){
                try {
                    const removedBoard = await Board.remove({ _id: leaveBoard._id });
                    console.log("[OnPlayerLeaveBoard] - Empty Board - Delete Board: " + removedBoard);
                } catch (error) {
                    console.log("[OnPlayerLeaveBoard] - Empty Board - Delete Board - Error: " + error);
                }
            }
        }
        // error
        else{
            res.status(StatusConstant.Error).send({message: ""});
            console.log("[OnPlayerLeaveBoard] - ID Player is not existed in board: " + error);
        }
    }
    else{
        res.status(StatusConstant.Error).send({message: "Board is not existed!"});
        console.log("[OnPlayerLeaveBoard] - Board is not existed: " + error);
    }

};



/*
    GET LIST BOARD
    - USER Id: string
 */
module.exports.getListBoard = async function(req, res, next)
{
    try {
        const listBoard = await Board.find({})
        .populate({path: 'owner', select:"fullname" })
        .populate({path: 'player', select: "fullname"})
        .exec();
        const listBoardInProgress = listBoard.filter(board=>board.boardStatus !== BoardConstants.INRESULT_STATUS);
        res.status(StatusConstant.Ok).send(listBoardInProgress);
        console.log(`[GetListBoard] - Success: length ${listBoardInProgress.length}`);
    }catch(error) {
        res.status(StatusConstant.Error).send({message: error});
        console.log(`[GetListBoard] - Error: ${error}`);
    }
};

/*
    GET INFO OF TWO USER IN BOARD
    //params: BoardID
*/ 

module.exports.getInfoOfTwoPlayer = async function(req,res,next) {
    const boardID = req.params.boardID;

    //get board info by boardID
    try {   
        const board = await Board.findById({_id: boardID})
        .populate({path: "owner",select: "fullname elo"})
        .populate({path: "player",select: "fullname elo"})
        .populate({path: "history"})
        .exec();
        console.log(`[GetBoard] - Success ${board._id}`);
        return res.status(StatusConstant.Ok).send(board);
    } catch (error) {
        console.log(`[GetBoard] - Error: ${error}`);
        return res.status(StatusConstant.Error).send({message: error});
    }

};

/*
    POST HISTORY GAME
    sample: 
    -history:{
        ownerID: 'String',
        playerID: 'String',
        boardID: 'String',
        gameStatus: 0,
        eloGot: 200,
        winningLine:[Array],
        history: [[Array],[Array],[Array],[Array],[Array],.....]
        message: [Array]
    }
*/
module.exports.saveHistoryGame = async function(req,res,next) {
    //get history from body of POST request
    const receiveData = req.body;
    
    //config type of hitory to type in schema
    receiveData.history = Array.from(receiveData.history).map(data =>{
        return {
            step: data
        };
    })
    
    //save data
    try {
        const newHistory = new History(receiveData);

        const result =  await newHistory.save();
        res.status(StatusConstant.Ok).send(result);
        console.log(`[SaveHitory] - Success: ${result}`);
    } catch (error) {
        res.status(StatusConstant.Error).send({message: error});
        console.log(`[SaveHstory] - Error: ${error}`);
    }
};
