const StatusConstant = require('../config/StatusResponseConfig');
const Board = require('../models/Board.M');
const ListOnlineUser = require("../socket.io/ListOnlineUser");
const BoardConstants = require('../config/Board.Cfg');

const iGomokuCOntrollers = {
    getHomePageInfo: async (req,res,next) =>{
        try {
            const listOnlUsers = ListOnlineUser.getListOnlineUser();
            const listBoard = await Board.find({})
            .populate({path: 'owner', select:"fullname" })
            .populate({path: 'player', select: "fullname"})
            .exec();
            const listBoardInProgress = listBoard.filter(board=>board.boardStatus !== BoardConstants.INRESULT_STATUS);
            console.log(`[Online User]:${listOnlUsers.length} [Board]: ${listBoardInProgress.length}`)
            return res.status(StatusConstant.Ok).send({
                users: listOnlUsers,
                boards: listBoardInProgress,
            });
            
        }catch(error) {
            console.log(`[GetListBoard] - Error: ${error}`);
            return res.status(StatusConstant.Error).send({message: error});
            
        }
       
    }
}

module.exports = iGomokuCOntrollers;