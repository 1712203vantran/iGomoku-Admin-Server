const mongoose = require('mongoose');

// Friend Scheme
/*
    - user01: string (id of user)
    - user02: string (id of user)
    - DOMF: date // date of making friend
*/ 

const FriendSchema = mongoose.Schema({
    user01: {
        type: String,
        required: true
    },
    user02: {
        type: String,
        required: true
    },
    dateOfMakingFriend: {
        type: String,
        default: new Date()
    }
});

module.exports = mongoose.model('Friend', FriendSchema);