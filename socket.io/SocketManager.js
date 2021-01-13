let socketList = [];

const SocketManager = {
    push: (socket) =>{
        socketList.push({socket: socket, listener: []});
    },

    removeSocket: (socketID)=>{
        socketList = socketList.filter(socket =>{
            if (socket.socket.id !== socketID)
            {
                return socket;
            }
            return null;
        })
    },

    getSocketBySocketID: (socketID) =>{
        for (let i =0 ;i<socketList.length; i++)
        {
            if (socketList[i].socket.id === socketID)
            {
                return socketList[i];
            }
        }
        return null;
    },

    setSocketOn(socketID, TAG, callback) {
        for (let i = 0; i < socketList.length; i++) {
          const { socket, listener } = socketList[i];
    
          if (socket.id === socketID) {
            for (let j = 0; j < listener.length; j++) {
              if (listener[j].TAG === TAG) return;
            }
    
            socketList[i].listener = listener.concat({
              TAG,
              callback: callback,
            });
            socketList[i].socket.on(TAG, callback);
    
            return;
          }
        }
      },

    removeSocketOn(socketID, TAG) {
        for (let i = 0; i < socketList.length; i++) {
          const { socket, listener } = socketList[i];
    
          if (socket.id === socketID) {
            for (let j = 0; j < listener.length; j++) {
              if (listener[j].TAG === TAG) {
                const callback = listener[j].callback;
    
                socketList[i].socket.off(TAG, callback);
                socketList[i].listener = listener.filter((item) => {
                  if (item.TAG !== TAG) return item;
                  return null;
                });
    
                return;
              }
            }
            return;
          }
        }
      }
}

module.exports = SocketManager;