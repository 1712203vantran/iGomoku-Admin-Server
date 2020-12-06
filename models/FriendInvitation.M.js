const mongoose = require('mongoose');

// Friend Scheme
/*
    - fromUser: string (id of user send)
    - toUser: string (id of user receive)
    - DOSR: date // date of sending request
*/ 

const FriendInvitationSchema = mongoose.Schema({
    fromUser: {
        type: String,
        required: true
    },
    toUser: {
        type: String,
        required: true
    },
    dosr: {
        type: String,
        default: new Date()
    }
});

module.exports = mongoose.model('FriendInvitation', FriendInvitationSchema);