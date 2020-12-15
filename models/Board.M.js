const mongoose = require('mongoose');
const BoardConstants = require('../config/Board.Cfg');

// Board Scheme
/*
    - Owner: user create board
    - player: enemy of owner
    - board name: String
    - created time: date time
    - board status: int (1-waiting, 2-in game, 3-in result)
*/ 

const BoardScheme = mongoose.Schema({
    owner: {
        type: String,
        required: true
    },
    player: {
        type: String,
        required: false,
        default: null
    },
    boardName: {
        type: String,
        required: true
    },
    createdTime: {
        type: Date,
        default: new Date()
    },
    boardStatus: {
        type: Number,
        default: BoardConstants.WATING_STATUS
    }
});

module.exports = mongoose.model('Board', BoardScheme);