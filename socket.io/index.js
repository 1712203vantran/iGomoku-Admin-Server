const EVENT_NAMES =require('../config/SocketIO.Cfg');
const socketIo = require("socket.io");
const ListOnlineUser = require('./ListOnlineUserManager');
const Account = require('../models/Account.M');
const AuthUtils = require('../utils/Auth.Utils');
const SocketManager = require('./SocketManager');
const BoardManager = require('./BoardMangager');
const JWTCfg = require('../config/JWT.Cfg');
const BoardConstants = require('../config/Board.Cfg');

let io = null;

const getioInstance =() => {
    return io;
}

const configSocketIO = (server) =>{
    io = socketIo(server, {
        cors: true,
        //origins: ["http://127.0.0.1:3000"],
     });
     
    io.on(EVENT_NAMES.CONNECTION, (socket) => {
        console.log(`Socket [${socket.id}]: connected.`);
        //socket managerment anonymous user & sign in user 
        SocketManager.push(socket);
        //user already login before(has jwt token), open another tab
        socket.on(EVENT_NAMES.REQUEST_USER_ONLINE, async ({jwtToken})=>{
            try{    
                const decoded = await AuthUtils.verifyJwtToken(jwtToken, JWTCfg.secret);              
                const user = await Account.findById({_id: decoded.userID}).exec();
                if (user)
                {
                    ListOnlineUser.addNewUserConnect(user, socket.id);
                    //thông báo tới tất cả các socket đang kết nối người dùng đã đăng nhập
                    io.emit(EVENT_NAMES.RESPONSE_USER_ONLINE, {user});
                }
            }catch(error)
            {
                console.error(error);
                socket.emit(EVENT_NAMES.EXPIRED_TOKEN);
            }
           
            // if (user.userID !== "0")
            // {    
               
            // }
            // else{
            //     const listUser = ListOnlineUser.getListOnlineUser();
            //     //người dùng ẩn danh muốn xem danh sách người choi đã đăng nhập
            //     socket.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
            // }
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
        //gửi lời mời tham gia trận đấu thơi người chơi chỉ định
        // socket.on(EVENT_NAMES.INVITE_JOIN_MATCH, (info) =>{
        //     const dataReceive = info;
        //     console.log(`[Send invite]: ${dataReceive.socketID}`);
        //     io.to(dataReceive.socketID).emit(EVENT_NAMES.INVITE_JOIN_MATCH, JSON.stringify(dataRevice));
        //     socket.join(dataReceive.boardID);
        // });

        //chập nhận lời mời tham gia phòng chơi
        // socket.on(EVENT_NAMES.ACCEPT_INVITE, (info) =>{
        //     console.log({info});
        //     socket.to(info.boardID).emit(EVENT_NAMES.START_GAME, (info.boardID));
        //     socket.join(info.boardID);
        // });

        socket.on(EVENT_NAMES.JOIN_BOARD, ({boardID}) =>{
            socket.join(boardID);
            console.log(`[${socket.id}]: join board ${boardID}`);
            BoardManager.joinBoard(boardID, socket.id);
        })

        socket.on(EVENT_NAMES.START_GAME, ({boardID}) =>{
            BoardManager.startGame(boardID);
            console.log("Start game");
            io.in(boardID).emit(EVENT_NAMES.START_GAME, {ststus: BoardConstants.INGAME_STATUS});
        });

        //nhận tin nhắn và gửi cho những người khác trong phòng
        socket.on(EVENT_NAMES.MSG_FROM_CLIENT, (data)=>{
            const dataRevice = JSON.parse(data);
            //console.log(`[MESSAGE]: ${data}`);
            socket.to(dataRevice.boardID).emit(EVENT_NAMES.MSG_TO_CLIENT, JSON.stringify(dataRevice));
        });

        //nhận bước di chuyển và gửi cho những người khác trong phòng
        socket.on(EVENT_NAMES.STEP_FROM_CLIENT, (data)=>{
            const dataRevice = JSON.parse(data);
            //.log(`[Step]: ${data}`);
            socket.to(dataRevice.boardID).emit(EVENT_NAMES.STEP_TO_CLIENT, JSON.stringify(dataRevice));
        });

        //socket ngắt kết nối
        socket.on(EVENT_NAMES.DISCONNECT, () => {
            console.log(`Socket [${socket.id}]: disconnected.`);
            const userID = ListOnlineUser.getUserIDBySocketID(socket.id);
            if (userID)
            {
                ListOnlineUser.removeUser(socket.id);
                io.emit(EVENT_NAMES.RESPONSE_USER_OFFLINE, {userID});
            }
        });
    });
}


const realTimeActions = {
    //realtime actions for User List
    updateOnlineUserList: (user, socketID)=>{
        ListOnlineUser.addNewUserConnect(user, socketID);
        io.emit(EVENT_NAMES.RESPONSE_USER_ONLINE, {user});   
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
            //BoardManager.push(socketID, newBoard);
            io.emit(EVENT_NAMES.RESPONSE_NEW_BOARD, {newBoard});
        }    
        
    },
    //another user join board
    notifyUser: (boardID, playerID, ownerID)=>{
        //ownerID
        const socketOwnerID = ListOnlineUser.getSocketIDByuserID(ownerID);
        const socketPlayerID = ListOnlineUser.getSocketIDByuserID(playerID);
        console.log({result: socketOwnerID && socketPlayerID})
        if (socketOwnerID && socketPlayerID)
        {
            console.log(`[Board]: notify ${socketPlayerID} & ${socketPlayerID}`);
            //BoardManager.joinBoard(socketOwnerID, boardID);
            io.to(socketOwnerID).to(socketPlayerID).emit(EVENT_NAMES.JOIN_BOARD, {boardID});
        }        
    }
}

module.exports = {
    configSocketIO, 
    getioInstance,
    realTimeActions
};