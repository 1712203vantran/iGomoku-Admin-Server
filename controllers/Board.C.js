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
    const userId = req.body.userID; // user create board (owner)
    const boardName = req.body.boardName;
    const isPrivate = req.body.isPrivate;
    const password = req.body.password;
    const player = req.body.player;

    const boardInfo = {
        owner: userId,
        boardName: boardName,
        boardStatus: BoardConstants.WATING_STATUS, //watting
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
        console.log(`[CreateNewBoard] - By ${userId} - Board: ${savedBoard}`);

        //realtime invite for player
        realTimeActions.sendInviteToPlayer(savedBoard._id, player);
        return res.status(StatusConstant.Ok).send(savedBoard);
    } catch (error) {
        res.status(StatusConstant.Error).send({ message: error });
        console.log(`[CreateNewBoard] - By ${userId} - Error: ${error}`);
    }
};

/*
    DELETE BOARD
    - boardId: string
 */
module.exports.deleteBoard = async function (req, res, next) {
    const boardId = req.body.boardId;

    // delete board
    try {
        const removedBoard = await Board.remove({ _id: boardId });
        res.status(StatusConstant.Ok).send(removedBoard);
        console.log(`[DeleteBoard] - BoardID ${boardId} - Board ${board}`);
    } catch (error) {
        res.status(StatusConstant.Error).send({message: error});
        console.log(`[DeleteBoard] - BoardID ${boardId} - Error ${error}`);
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
    const playerId = req.body.userID;
    const boardId = req.body.boardID;

    try {
        const joinBoard = await Board.updateOne(
            {_id: boardId},
            { $set: 
                {
                    player: playerId,
                    boardStatus: BoardConstants.INGAME_STATUS,
                }
            },
            
        );
        res.status(StatusConstant.Ok).send(joinBoard);
        console.log(`[PlayerJoinBoard] - BoardId ${boardId} - PlayerId ${playerId}`);
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
        const board = await Board.findById({_id: boardID}).
                                    populate({path: "owner",select: "fullname"}).
                                    populate({path: "player",select: "fullname"}).exec();
        //find owner info and player info ID in board
        // const ownerID = board.owner;
        // const playerID = board.player;
        // const boardInfo = await Object.assign({},board.toJSON(), {
        //     ...board,
        //     owner: {},
        //     player: {},
        // });
        
        // boardInfo.owner = await Account.findById({_id: ownerID}).exec();
       
        // boardInfo.player = await Account.findById({_id: playerID}).exec();

        res.status(StatusConstant.Ok).send(board);
        console.log(`[GetBoard] - Success ${board}`);
    } catch (error) {
        res.status(StatusConstant.Error).send({message: error});
        console.log(`[GetBoard] - Error: ${error}`);
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
