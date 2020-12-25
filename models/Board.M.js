const mongoose = require('mongoose');
const BoardConstants = require('../config/Board.Cfg');
const Account = require('./Account.M');

// Board Scheme
/*
    - Owner: user create board
    - player: enemy of owner
    - board name: String
    - created time: date time
    - board status: int (1-waiting, 2-in game, 3-in result)
    - isPrivate: Boolean (require password to join board,0: public, 1: private)
    - password: String ( password of board)
    - watchers: Array (number of user watch this game) 
*/ 

const BoardSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
    },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
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
    },
    isPrivate: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        default: ""
    },
    watchers: {
        type: Array,
        default: []
    }
});

//mapping boardId to account everytime create new board
BoardSchema.pre('save', async function(next){
   try {
    console.log(this);
    const account = await Account.findById({_id: this.owner});

    account.matches.push(this._id);
    await account.save();
    next();
   } catch (error) {
       console.log({error});
       next(error);
   }

});

BoardSchema.pre("update", async function(next){
    try {
        console.log(this);
        const account = await Account.findById({_id: this.player});
    
        account.matches.push(this._id);
        await account.save();
        next();
       } catch (error) {
           console.log({error});
           next(error);
       }
    
});


module.exports = mongoose.model('Board', BoardSchema);