const mongoose = require('mongoose');

const HistoryStepSchema = mongoose.Schema({
    player:{
        type: Number,
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
    result: {
        type: Number,
        default: 0
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
     await account.matches.push(this._id);
     await account.save();
     next();
    } catch (error) {
        console.log({error});
        next(error);
    }
 
 });
 
 HistoryGameSchema.pre("update", async function(next){
     try {
         
         const account = await Account.findById({_id: this.playerID});
         account.matches.push(this._id);
         await account.save();
         next();
        } catch (error) {
            console.log({error});
            next(error);
        }
     
 });


module.exports = mongoose.model('HistoryGame', HistoryGameSchema);;