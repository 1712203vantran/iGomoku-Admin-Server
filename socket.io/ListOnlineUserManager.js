
const Account = require('../models/Account.M');
const StatusResponseConfig = require('../config/StatusResponseConfig');
//store list of online user base on socket connect 
let clients = [];

const ListOnlineUser = {
    //get user's info by userID and add new user to list online user
    //input: user.userID ,  socket: socket of client 
    addNewUserConnect: (newClient) =>{
        
        if(clients.some((client) => client._id.equals(newClient._id)))
        {
            clients = clients.map(client =>{
                if (client._id.equals(newClient._id))
                {
                    return newClient;
                }
                return client;
            });
        }
        else{
            clients.push(newClient);
        }
        //console.log(clients);
    },

    getListOnlineUser: () =>{
        return clients;
    },

    removeUser: (socketID) =>{
        //clients = clients.filter(client => !client.socketID === socketID);
        clients = clients.filter(client =>{
            if (client.socketID !== socketID)
            {
                return client;
            }
        })
    },

    getUserIDBySocketID: (socketID) =>{
        for (let i = 0;i<clients.length;i++)
        {
            if (clients[i].socketID === socketID)
            {
                return clients[i]._id;
            }
        }
        return null;
    },
    
    getSocketIDByuserID: (userID) =>{
        for (let i = 0;i<clients.length;i++)
        {
            if (clients[i]._id.equals(userID))
            {
                return clients[i].socketID;
            }
        }
        return null;
    },
    isContainUser: (userID)=>{
        return !clients.every(client => client._id !== userID);
    }
}

module.exports = ListOnlineUser;