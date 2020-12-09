
const Account = require('../models/Account.M');
const StatusResponseConfig = require('../config/StatusResponseConfig');
//store list of online user base on socket connect 
let clients = [];

const listOnlineUser = {
    //get user's info by userID and add new user to list online user
    //input: user.userID ,  socket: socket of client 

    addNewUserConnect: async (user, socket) =>{
        try {
            const client = await Account.findById(user.userID).exec();
           
            const clientObj = {
                permission: client.permission,
                username: client.username,
                fullname: client.fullname,
                _id: client._id,
                elo: client.elo,
                socketID: socket.id,
            }
            
            checkEsixts = (user) => !user._id.equals(clientObj._id);

            if (clients.length === 0)
            {
                clients.push(clientObj);
                
            }
            else if (clients.every(checkEsixts))
            {
                clients.push(clientObj); 
            }

            return StatusResponseConfig.OK;
        } catch (error) {
            console.log(error);
            return StatusResponseConfig.ERROR;
        }
    },

    getListOnlineUser: () =>{
        return clients;
    },

    removeUser: (user) =>{
        clients = clients.filter(client => client._id !== user.userID);
    }
}

module.exports = listOnlineUser;