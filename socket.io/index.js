const EVENT_NAMES =require('../config/SocketIO.Cfg');
const socketIo = require("socket.io");
const listOnlineUser = require('../db/ListOnlineUser');
const StatusResponseConfig = require('../config/StatusResponseConfig');

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

        //event lấy danh sách các người chơi đang online
        socket.on(EVENT_NAMES.REQUEST_USER_LIST, async (user)=>{

            const listUser = listOnlineUser.getListOnlineUser();
            console.log(`[Online user]:  ${listUser.length}`);
            //thông báo tới tất cả các sockt đang kết nối người dùng đã đăng nhập
            io.sockets.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
            // if (user.userID !== "0")
            // {
            //     status = await listOnlineUser.addNewUserConnect(user, socket);
            //     if (status === StatusResponseConfig.Ok)
            //     {   
            //         const listUser = listOnlineUser.getListOnlineUser();
            //         console.log(`[Online user]:  ${listUser.length}`);
            //         //thông báo tới tất cả các sockt đang kết nối người dùng đã đăng nhập
            //         io.sockets.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
            //     }
            // }
            // else{
            //     const listUser = listOnlineUser.getListOnlineUser();
            //     //người dùng ẩn danh muốn xem danh sách người choi đã đăng nhập
            //     socket.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
            // }
        });
        
        //xóa người dùng khi sign out
        socket.on(EVENT_NAMES.SIGN_OUT, (user)=>{
            console.log(`Socket [${socket.id}]: sign out.`);
            listOnlineUser.removeUser(user);

            const listUser = listOnlineUser.getListOnlineUser();
            socket.broadcast.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
        });
        //gửi lời mời tham gia trận đấu thơi người chơi chỉ định
        socket.on(EVENT_NAMES.INVITE_JOIN_MATCH, (info) =>{
            const dataReceive = info;
            console.log(`[Send invite]: ${dataReceive.socketID}`);
            io.to(dataReceive.socketID).emit(EVENT_NAMES.INVITE_JOIN_MATCH, JSON.stringify(dataRevice));
            socket.join(dataReceive.boardID);
        });

        //chập nhận lời mời tham gia phòng chơi
        socket.on(EVENT_NAMES.ACCEPT_INVITE, (info) =>{
            //console.log({info});
            socket.to(info.boardID).emit(EVENT_NAMES.START_GAME, (info.boardID));
            socket.join(info.boardID);
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
            //listOnlineUser.removeUser(user);
        });
    });
}


const realTimeActions = {
    
    updateOnlineUserList: (user, socketID)=>{
        listOnlineUser.addNewUserConnect(user, socketID);
        const listUser = listOnlineUser.getListOnlineUser();
        io.sockets.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
    },
}

module.exports = {
    configSocketIO, 
    getioInstance,
    realTimeActions
};