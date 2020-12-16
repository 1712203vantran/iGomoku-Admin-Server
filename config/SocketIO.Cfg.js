const listOnlineUser = require('../db/ListOnlineUser');
const StatusResponseConfig = require('../config/StatusResponseConfig');


const EVENT_NAMES = {
    REQUEST_USER_LIST: "request-list-online-user",
    RESPONSE_USER_LIST: "response-list-online-user",
    SIGN_OUT: 'sign-out',
    DISCONNECT: "disconnect",
    INVITE_JOIN_MATCH: "invite-player",
    ACCEPT_INVITE: "accept-invite",
    START_GAME: "start-game",

};


// config for socket.io and catch event 
const configSocketIO = (io) =>{
    io.on("connection", (socket) => {
        console.log(`Socket [${socket.id}]: connected.`);

        //event lấy danh sách các người chơi đang online
        socket.on(EVENT_NAMES.REQUEST_USER_LIST, async (user)=>{
            let status = StatusResponseConfig.Ok;

            if (user.userID !== "0")
            {
                status = await listOnlineUser.addNewUserConnect(user, socket);
                if (status === StatusResponseConfig.Ok)
                {   
                    const listUser = listOnlineUser.getListOnlineUser();
                    console.log(listUser.length);
                    //thông báo tới tất cả các sockt đang kết nối người dùng đã đăng nhập
                    io.sockets.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
                }
            }
            else{
                const listUser = listOnlineUser.getListOnlineUser();
                //người dùng ẩn danh muốn xem danh sách người choi đã đăng nhập
                socket.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
            }
        });
        
        //xóa người dùng khi sign out
        socket.on(EVENT_NAMES.SIGN_OUT, (user)=>{
            console.log(`Socket [${socket.id}]: sign out.`);
            listOnlineUser.removeUser(user);

            const listUser = listOnlineUser.getListOnlineUser();
            console.log(listUser.length);
            socket.broadcast.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
        });
        //gửi lời mời tham gia trận đấu thơi người chơi chỉ định
        socket.on(EVENT_NAMES.INVITE_JOIN_MATCH, (info) =>{
            const dataRevice = JSON.parse(info);
            
            io.to(dataRevice.player.socketID).emit(EVENT_NAMES.INVITE_JOIN_MATCH, JSON.stringify(dataRevice));
            socket.join(dataRevice.boardID);
        });

        //chập nhận lời mời tham gia phòng chơi
        socket.on(EVENT_NAMES.ACCEPT_INVITE, (info) =>{
            console.log(info);
            socket.to(info.boardId).emit(EVENT_NAMES.START_GAME, (info.boardID));
            socket.join(info.boardID);
        });

        //socket ngắt kết nối
        socket.on(EVENT_NAMES.DISCONNECT, () => {
            console.log(`Socket [${socket.id}]: disconnected.`);
            //listOnlineUser.removeUser(user);
        });
    });
}

module.exports =  configSocketIO;