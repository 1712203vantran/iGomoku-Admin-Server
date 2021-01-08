const EVENT_NAMES =require('../config/SocketIO.Cfg');
const socketIo = require("socket.io");
const ListOnlineUser = require('./ListOnlineUserManager');
const Account = require('../models/Account.M');
const AuthUtils = require('../utils/Auth.Utils');
const SocketManager = require('./SocketManager');

const JWTCfg = require('../config/JWT.Cfg');


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
                    const isSuccess = ListOnlineUser.addNewUserConnect(user, socket.id);
                    if(isSuccess)
                    {
                        //thông báo tới tất cả các socket đang kết nối người dùng đã đăng nhập
                        io.emit(EVENT_NAMES.RESPONSE_USER_ONLINE, {user});
                    }
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
        const isSuccess = ListOnlineUser.addNewUserConnect(user, socketID);
        if(isSuccess)
        {
            io.emit(EVENT_NAMES.RESPONSE_USER_ONLINE, {user});
        }   
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
            socketJoin.join(newBoard._id.toString());
        }    
        io.emit(EVENT_NAMES.RESPONSE_NEW_BOARD, {newBoard});
    },
    //another user join board
    joinBoard: (boardID, userID)=>{
        const socketID = ListOnlineUser.getSocketIDByuserID(userID);
        const socketJoin = SocketManager.getSocketBySocketID(socketID);
        if (socketJoin)
        {
            console.log(`[Board]: Socket ${socketID} join ${boardID}`);
            socketJoin.join(boardID);
            io.in(boardID).emit(EVENT_NAMES.JOIN_BOARD, {boardID});
        }        
    }
}

module.exports = {
    configSocketIO, 
    getioInstance,
    realTimeActions
};