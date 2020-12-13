const listOnlineUser = require('../db/ListOnlineUser');
const StatusResponseConfig = require('../config/StatusResponseConfig');


const EVENT_NAMES = {
    REQUEST_USER_LIST: "request-list-online-user",
    RESPONSE_USER_LIST: "response-list-online-user",
    SIGN_OUT: 'sign-out',
    DISCONNECT: "disconnect"
};


// config for socket.io and catch event 
const configSocketIO = (io) =>{
    io.on("connection", (socket) => {
        console.log(`Socket [${socket.id}]: connected.`);

        socket.on(EVENT_NAMES.REQUEST_USER_LIST, async (user)=>{
            let status = StatusResponseConfig.Ok;

            if (user.userID !== "0")
            {
                status = await listOnlineUser.addNewUserConnect(user, socket);
                if (status === StatusResponseConfig.Ok)
                {   
                    const listUser = listOnlineUser.getListOnlineUser();
                    console.log(listUser.length);
                    io.sockets.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
                }
            }
            else{
                const listUser = listOnlineUser.getListOnlineUser();
                socket.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
            }
        })
           
        socket.on(EVENT_NAMES.SIGN_OUT, (user)=>{
            console.log(`Socket [${socket.id}]: sign out.`);
            listOnlineUser.removeUser(user);

            const listUser = listOnlineUser.getListOnlineUser();
            console.log(listUser.length);
            socket.broadcast.emit(EVENT_NAMES.RESPONSE_USER_LIST, JSON.stringify(listUser));
        })

        socket.on(EVENT_NAMES.DISCONNECT, () => {
            console.log(`Socket [${socket.id}]: disconnected.`);
            //listOnlineUser.removeUser(user);
        });
    });
}

module.exports =  configSocketIO;