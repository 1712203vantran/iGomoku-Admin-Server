const mongoose = require('mongoose');
const Utils = require('../utils/Utils');

// Account Scheme
/*
    - Username: String
    - Password: String/ md5 hash
    - Fullname: String
    - Email: String
    - Permission: int (0-user, 1-admin)
    - elo: int (ranking)
    - account status: unsigned int (-1: not-vetify, 0-normal, 1-blocked)
    - createdDate: date
    - matches: int (number of games played)
    - winningGames: int (number of winning game)
    - autoMatch: Boolean (auto match oppnent)
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
    email: {
        type: String,
        default: ""
    },
    permission: {
        type: Number,
        default: 0
    },
    createdDate: {
        type: Date,
        default: new Date()
    },
    elo: {
        type: Number,
        default: 600
    },
    accountStatus: {
        type: Number,
        default: -1
    },
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
        default: []
    }],
    winningGame: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
        default: []
    }],
    autoMatch: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Account', AccountSchema);