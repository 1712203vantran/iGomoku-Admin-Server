let socketList = [];

const SocketManager = {
    push: (socket) =>{
        socketList.push(socket);
    },

    removeSocket: (socketID)=>{
        socketList = socketList.filter(socket =>{
            if (socket.id !== socketID)
            {
                return socket;
            }
            return null;
        })
    },

}

module.exports = SocketManager;