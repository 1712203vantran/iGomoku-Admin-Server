const mongoose = require('mongoose');

// History Game Scheme
/*
    - user: history of user
    - enemy: enemy of user
    - board: String (id of board)
    - created time: date time
    - game status: int (1-win, 2-lose, 3-tie)
    - timePlaying: int (seconds)
    - elo: int
    - xu: int
*/ 

const HistoryGameScheme = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    enemy: {
        type: String,
        required: true
    },
    board: {
        type: String,
        required: true
    },
    createdTime: {
        type: Date,
        default: new Date()
    },
    gameStatus: {
        type: Number,
        required: true
    },
    timePlaying: {
        type: Number,
        required: true
    },
    xu: {
        type: Number,
        required: true
    },
    elo: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('HistoryGame', HistoryGameScheme);