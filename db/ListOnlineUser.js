
const Account = require('../models/Account.M');
const StatusResponseConfig = require('../config/StatusResponseConfig');
//store list of online user base on socket connect 
let clients = [];

const listOnlineUser = {
    //get user's info by userID and add new user to list online user
    //input: user.userID ,  socket: socket of client 
    addNewUserConnect: async (user, socketID) =>{
      
        const client = Object.assign({},user.toJSON());
        client.socketID = socketID;
        
        console.log(client);
        checkEsixts = (user) => !user._id.equals(client._id);

        if (clients.length === 0)
        {
            clients.push(client);
            
        }
        else if (clients.every(checkEsixts))
        {
            clients.push(client); 
        }
    },

    getListOnlineUser: () =>{
        return clients;
    },

    removeUser: (user) =>{
        clients = clients.filter(client => !client._id.equals(user.userID));
    }
}

module.exports = listOnlineUser;