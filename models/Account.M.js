const mongoose = require('mongoose');

// Account Scheme
/*
    - Username: String
    - Password: String/ md5 hash
    - Fullname: String
    - Permission: int (0-user, 1-admin)
    - Xu: unsigned int (money in game)
    - account status: unsigned int (0-normal, 1-blocked)
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
        type: Int16Array,
        default: 0
    },
    xu: {
        type: Int32Array,
        default: 100
    },
    elo: {
        type: Int32Array,
        default: 600
    },
    accountStatus: {
        type: Int8Array,
        default: 0
    }
});

module.exports = mongoose.model('Account', AccountSchema);