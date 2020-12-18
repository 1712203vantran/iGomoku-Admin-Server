const mongoose = require('mongoose');

const HistoryStepSchema = mongoose.Schema({
    step:{
        type: Array,
        require: true,
    }
});

// History Game Scheme
/*
    - owner: userID
    - player: enemyID
    - board: String (id of board)
    - created time: date time
    - game status: int (1-win, 2-lose, 3-tie)
    - history: Array[HistoryStep] (history steps)
    - eloGot: int (getted elo of winer)
    - winningLine: Array (position of elements in the winning line) 
*/ 

const HistoryGameSchema = mongoose.Schema({
    ownerID: {
        type: String,
        required: true
    },
    playerID: {
        type: String,
        required: true
    },
    boardID: {
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
    history: {
        type: [HistoryStepSchema],
        
    },
    eloGot: {
        type: Number,
        required: true
    },
    winningLine: {
        type: Array,
        default: [],
    }
});




module.exports = mongoose.model('HistoryGame', HistoryGameSchema);;