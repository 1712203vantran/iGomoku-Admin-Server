const EVENT_NAMES =require('../config/SocketIO.Cfg');
const socketIo = require("socket.io");
const ListOnlineUser = require('./ListOnlineUserManager');
const Account = require('../models/Account.M');
const AuthUtils = require('../utils/Auth.Utils');
const SocketManager = require('./SocketManager');
const BoardManager = require('./BoardMangager');
const JWTCfg = require('../config/JWT.Cfg');
const BoardConstants = require('../config/Board.Cfg');
const HistoryGameM = require('../models/HistoryGame.M');

let io = null;

const configSocketIO = (server) =>{
    io = socketIo(server, {
        cors: true,
        //origins: ["http://127.0.0.1:3000"],
     });
     
    io.on(EVENT_NAMES.CONNECTION, (socket) => {
        console.log(`Socket [${socket.id}]: connected.`);
        //socket managerment anonymous user & sign in user 
        SocketManager.push(socket);

        BoardManager.setIo(io);
        //user already login before(has jwt token), open another tab
        socket.on(EVENT_NAMES.REQUEST_USER_ONLINE, async ({jwtToken, status})=>{
            try{    
                const decoded = await AuthUtils.verifyJwtToken(jwtToken, JWTCfg.secret);              
                const user = await Account.findById({_id: decoded.userID}).exec();
                
                if (user)
                {
                    //console.log(`re sign in user${socket.id}`);
                    const newUser  = Object.assign({
                        isFree: status,
                        socketID: socket.id
                    }, user.toJSON());
                    //console.log(newUser);
                    ListOnlineUser.addNewUserConnect(newUser);
                    //thông báo tới tất cả các socket đang kết nối người dùng đã đăng nhập
                    io.emit(EVENT_NAMES.RESPONSE_USER_ONLINE, {user: newUser});
                }
            }catch(error)
            {
                console.error(error);
                socket.emit(EVENT_NAMES.EXPIRED_TOKEN);
            }
        });
        
        //xóa người dùng khi sign out
        socket.on(EVENT_NAMES.SIGN_OUT, ()=>{
            console.log(`Socket [${socket.id}]: sign out.`);
            const offlineUser = ListOnlineUser.getUserIDBySocketID(socket.id);
            if (offlineUser)
            {
                ListOnlineUser.removeUser(socket.id);
                //remove socket from socketManager
                SocketManager.removeSocket(socket.id);
                io.emit(EVENT_NAMES.RESPONSE_USER_OFFLINE, {offlineUser});
            }
        });

        socket.on(EVENT_NAMES.JOIN_BOARD, ({boardID, userID}) =>{
            socket.join(boardID);
            console.log(`[${socket.id}]: join board ${boardID}`);
            BoardManager.joinBoard(socket.id, boardID, userID);
        });

        socket.on(EVENT_NAMES.START_GAME, ({boardID, userID}) =>{
            BoardManager.startGame(boardID);
            //console.log("Start game");
        });

        // socket.on(EVENT_NAMES.REQUEST_RECONNECT, ({ boardID }) => {
        //     const board = BoardManager.getBoardByID(boardID);
      
        //     if (board) {
        //         board.gameController.reConnect(socket.id);
        //     }
        //   });

        socket.on(EVENT_NAMES.REQUEST_UPDATE_PLAYER_INFO, ({boardID,owner,player})=>{
            socket.to(boardID).emit(EVENT_NAMES.RESPONSE_UPDATE_PLAYER_INFO, {
                owner,
                player
            });
        })
        //nhận tin nhắn và gửi cho những người khác trong phòng
        socket.on(EVENT_NAMES.MSG_FROM_CLIENT,async ({boardID, message, talker})=>{
            const history = await HistoryGameM.findOne({boardID: boardID});
            history.messages.push({message, talker});
            console.log(history.messages);
            history.markModified("messages");
            await history.save();

            socket.to(boardID).emit(EVENT_NAMES.MSG_TO_CLIENT, {message, talker});
        });

        //nhận bước di chuyển và gửi cho những người khác trong phòng
        // socket.on(EVENT_NAMES.STEP_FROM_CLIENT, (data)=>{
        //     const dataRevice = JSON.parse(data);
        //     //.log(`[Step]: ${data}`);
        //     socket.to(dataRevice.boardID).emit(EVENT_NAMES.STEP_TO_CLIENT, JSON.stringify(dataRevice));
        // });

        //socket ngắt kết nối
        socket.on(EVENT_NAMES.DISCONNECT, () => {
            console.log(`Socket [${socket.id}]: disconnected.`);
            const userID = ListOnlineUser.getUserIDBySocketID(socket.id);
            if (userID)
            {
                ListOnlineUser.removeUser(socket.id);
                //BoardManager.leaveBoard(socket.id);
                io.emit(EVENT_NAMES.RESPONSE_USER_OFFLINE, {userID});
            }
        });
    });
};

const realTimeActions = {
    //realtime actions for User List
    updateOnlineUserList: (user, socketID)=>{
        const newUser = Object.assign({
            isFree: 1,
            socketID: socketID
        }, user.toJSON());
        ListOnlineUser.addNewUserConnect(newUser);
        io.emit(EVENT_NAMES.RESPONSE_USER_ONLINE, {user: newUser});   
    },
    //send invite to join game from challenger
    sendInviteToPlayer: (boardID, player) =>{
        player.boardID = boardID;    
        const socketID = ListOnlineUser.getSocketIDByuserID(player._id);
        if (socketID)
        {
            console.log(`[Board]: Send Invite to ${socketID}`);
            io.to(socketID).emit(EVENT_NAMES.INVITE_JOIN_MATCH, {player});
        }
    },
    //add new board to board list 
    updateBoardActiveList: (socketID, newBoard) =>{ 
        const socketJoin = SocketManager.getSocketBySocketID(socketID);
        if (socketJoin)
        {
            console.log(`[Board]: Realtime ${socketJoin.id} join ${newBoard._id}`);
            //socketJoin.join(newBoard._id.toString());
            io.emit(EVENT_NAMES.RESPONSE_NEW_BOARD, {newBoard});
        }    
        
    },
    //another user join board
    notifyUser: (boardID, playerID, ownerID)=>{
        //ownerID
        const socketOwnerID = ListOnlineUser.getSocketIDByuserID(ownerID);
        const socketPlayerID = ListOnlineUser.getSocketIDByuserID(playerID);
        //console.log({socketOwnerID,socketPlayerID})
        if (socketOwnerID && socketPlayerID)
        {
            console.log(`[Board]: notify ${socketOwnerID} & ${socketPlayerID}`);
            io.to(socketPlayerID).emit(EVENT_NAMES.JOIN_BOARD, {boardID});
            io.to(socketOwnerID).emit(EVENT_NAMES.JOIN_BOARD, {boardID});
           
        }        
    }
}

module.exports = {
    configSocketIO, 
    io,
    realTimeActions
};