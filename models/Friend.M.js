const mongoose = require('mongoose');
const Account = require('./Account.M');

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


// FriendSchema.pre("save", function async (next){
//     try {
//         const {user01, user02} = this;

//         next();
//     } catch (error) 
//     {
//         console.log(error);
//         next(error);    
//     }
// });

module.exports = mongoose.model('Friend', FriendSchema);