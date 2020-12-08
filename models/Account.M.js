const mongoose = require('mongoose');
const Utils = require('../utils/Utils');

// Account Scheme
/*
    - Username: String
    - Password: String/ md5 hash
    - Fullname: String
    - Permission: int (0-user, 1-admin)
    - Xu: unsigned int (money in game)
    - account status: unsigned int (0-normal, 1-blocked)
    - createdDate: date
*/ 

const AccountSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    permission: {
        type: Number,
        default: 0
    },
    createdDate: {
        type: Date,
        default: new Date()
    },
    xu: {
        type: Number,
        default: 100
    },
    elo: {
        type: Number,
        default: 600
    },
    accountStatus: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Account', AccountSchema);