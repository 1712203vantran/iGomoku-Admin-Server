const mongoose = require('mongoose');
const Board = require('./Board.M');
const Account = require("./Account.M");

const HistoryStepSchema = mongoose.Schema({
    player:{
        type: Number,  //owner is 1, player is 2 
        require: true,
    },
    index:{
        type: Number,
        require: true,
    }
});

const MessageSchema = mongoose.Schema({
    talker:{
        type: String,
        require: true,
    },
    message:{
        type: String,
        require: true,
    }
});


// History Game Scheme
/*
    - owner: userID
    - player: enemyID
    - board: String (id of board)
    - created time: date time
    - result: int (1-win, 2-lose, 3-tie)
    - history: Array[HistoryStep] (history steps)
    - eloGot: int (getted elo of winer)
    - winningLine: Array (position of elements in the winning line) 
    - messages: Array (message sended when play game)
*/ 

const HistoryGameSchema = mongoose.Schema({
    ownerID: {
        type: String,
        required: true
    },
    playerID: {
        type: String,
        
    },
    boardID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
    },
    createdTime: {
        type: Date,
        default: new Date()
    },
    history: {
        type: [HistoryStepSchema],
        default: []
    },
    eloGot: {
        type: Number,
        required: true
    },
    winningLine: {
        type: Array,
        default: [],
    },
    messages: {
        type: [MessageSchema],
        default: [],
    }
});


//mapping boardId to account everytime create new board
HistoryGameSchema.pre('save', async function(next){
    try {
     const account = await Account.findById({_id: this.ownerID});
     await Board.findOneAndUpdate({_id: this.boardID},
        {
            history: this._id
        });
    } catch (error) {
        console.log({error});
        next(error);
    }
 
 });


module.exports = mongoose.model('HistoryGame', HistoryGameSchema);;