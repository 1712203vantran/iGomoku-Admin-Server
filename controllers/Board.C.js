const Board = require('../models/Board.M');
const Utils = require('../utils/Utils');
const StatusConstant = require('../config/StatusResponseConfig');
const BoardConstants = require('../config/Board.Cfg');

/*
    CREATE BOARD
    - userId: string
    - boardName: string
 */
module.exports.createBoard = async function (req, res, next) {
    const userId = req.body.userID; // user create board (owner)
    const boardName = req.body.boardName;
   
    const createdBoard = new Board({
        owner: userId,
        boardName: boardName
    });
    console.log(createdBoard);
    try {
        const savedBoard = await createdBoard.save();
        res.status(StatusConstant.Ok).send(savedBoard);
        console.log(`[CreateNewBoard] - By ${userId} - Board: ${savedBoard}`);
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
    const playerId = req.body.userId;
    const boardId = req.body.boardId;

    try {
        const joinBoard = await Board.updateOne(
            {_id: boardId},
            { $set: 
                {
                    player: playerId,
                }
            }
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
        const listBoard = await Board.find({}).exec();
        res.status(StatusConstant.Ok).send(listBoard);
        console.log(`[GetListBoard] - Success: ${listBoard}`);
    }catch(error) {
        res.status(StatusConstant.Error).send({message: error});
        console.log(`[GetListBoard] - Error: ${error}`);
    }
};
