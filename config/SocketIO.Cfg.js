const EVENT_NAMES = {

};

// config for socket.io and catch event 
const configSocketIO = (io) =>{
    io.on("connection", (socket) => {
        console.log(`Socket [${socket.id}]: connected.`);


        socket.on("disconnect", () => {
            console.log(`Socket [${socket.id}]: disconnected.`);
        });
    });
}

module.exports =  configSocketIO;