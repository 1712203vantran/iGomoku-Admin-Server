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

    getSocketBySocketID: (socketID) =>{
        for (let i =0 ;i<socketList.length; i++)
        {
            if (socketList[i].id === socketID)
            {
                return socketList[i];
            }
        }
        return null;
    }
}

module.exports = SocketManager;