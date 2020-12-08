const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Account = require('../models/Account.M');
const Friend = require('../models/Friend.M');
const FriendInvitation = require('../models/FriendInvitation.M');

// config
const StatusResponseConfig = require('../config/StatusResponseConfig');
const AccountConstants = require('../config/Account.Cfg');
const { createCollection } = require('../models/Account.M');

/*
    USER SEND MAKE FRIEND REQUEST
    - fromUser
    - toUser
 */
module.exports.sendMakingFriendRequest = async function(req, res, next)
{
    const fromUser_Id = req.body.fromUserId;
    const toUser_Id = req.body.toUserId;

    // id is not valid
    if(!ObjectId.isValid(fromUser_Id) || !ObjectId.isValid(toUser_Id)){
        res.status(StatusResponseConfig.ERROR).send({message: "Wrong id data !!", code: StatusResponseConfig.WRONG_DATA});
        return;
    }

    const fromUser = await Account.findOne({"_id": fromUser_Id, "permission": AccountConstants.PERMISSION_USER}).exec();
    const toUser = await Account.findOne({"_id": toUser_Id, "permission": AccountConstants.PERMISSION_USER}).exec();

    // Case one of fromUser or toUser is not exist (not included admin)
    if(!fromUser || !toUser){
        res.status(StatusResponseConfig.ERROR).send({message: "Wrong request !!", code: StatusResponseConfig.WRONG_REQUEST});
        return;
    }

    // case invitation is existed
    const f_Invitation = await FriendInvitation.findOne({"fromUser": fromUser_Id, "toUser": toUser_Id}).exec();
    if(f_Invitation){
        res.status(StatusResponseConfig.ERROR).send({message: "FriendInvitation is existed !!", code: StatusResponseConfig.DATA_EXISTED});
        return;
    }

    const makingFriendRequest = new FriendInvitation({
        fromUser: fromUser_Id,
        toUser: toUser_Id
    });

    try {
        const savedInvitation = await makingFriendRequest.save();
        res.status(StatusResponseConfig.OK).send(savedInvitation);
    }catch(error) {
        res.status(StatusResponseConfig.ERROR).send({message: error});
    }
};

/*
    ACCEPT OR REFUSE FRIEND INVITATION  
    - id (id of invitation)
    - userId (who send this request)
    - status (true: accept, false: refuse)
 */
module.exports.processingFriendInvitation = async function(req, res, next)
{
    var invitationId = req.body.invitationId;
    var userId = req.body.userId; // receiver
    var status = req.body.status;

    // id is not valid
    if(!ObjectId.isValid(invitationId) || !ObjectId.isValid(userId)){
        res.status(StatusResponseConfig.ERROR).send({message: "Wrong id data !!", code: StatusResponseConfig.WRONG_DATA});
        return;
    }

    var invitation = await FriendInvitation.findById(invitationId).exec();

    // if invitation not exist
    if(!invitation){
        res.status(StatusResponseConfig.ERROR).send({message: "This FriendInvitation is not existed !!", code: StatusResponseConfig.WRONG_REQUEST});
        return;
    }

    // if user send action is not user receive invitation
    if(userId !== invitation.toUser){
        res.status(StatusResponseConfig.ERROR).send({message: "User send request must be user received friend invitation !!", code: StatusResponseConfig.WRONG_REQUEST});
        return;
    }

    if(status){
        // check they are friend before ???
        const fFriend1 = await Friend.findOne({"user01": invitation.fromUser, "user02": invitation.toUser}).exec();
        const fFriend2 = await Friend.findOne({"user01": invitation.toUser, "user02": invitation.fromUser}).exec();

        if(fFriend1 || fFriend2){
            res.status(StatusResponseConfig.ERROR).send({message: "They are friend before !!", code: StatusResponseConfig.FRIENDSHIP_EXISTED});
            return;
        }

        // create new friendship
        const newFriend = new Friend({
            user01: invitation.fromUser,
            user02: invitation.toUser
        });

        try{
            const savedFriend = await newFriend.save();
            res.status(StatusResponseConfig.OK).send(savedFriend);
        } catch(error){
            res.status(StatusResponseConfig.ERROR).send({message: error});
        }
    }
    else{
        // TODO
    }
    
    // delete invitation
    try {
        const removedInvitation = await FriendInvitation.remove({_id: invitationId});
        console.log(`Delete Invitation ${invitationId} successfully!`);
    }catch(error) {
        console.log("Error delete invitation msg: " + error);
    }
};


/*
    UNFRIEND
    - Friend Id: string
    - Sender: string (user send this request)
 */
module.exports.unFriend = async function(req, res, next)
{
    const friend_id = req.body.friendId;
    const sender_id = req.body.userId;
    
    // id is not valid
    if(!ObjectId.isValid(friend_id) || !ObjectId.isValid(sender_id)){
        res.status(StatusResponseConfig.ERROR).send({message: "Wrong id data !!", code: StatusResponseConfig.WRONG_DATA});
        return;
    }

    // check friend_id is existed ??
    var fFriend = await Friend.findById(friend_id).exec();
    if(!fFriend){
        res.status(StatusResponseConfig.ERROR).send({message: "FriendShip is not existed !!", code: StatusResponseConfig.NOT_FOUND_DATA});
        return;
    }

    // check sender is have permission ???
    if(sender_id !== fFriend.user01 && sender_id !== fFriend.user02){
        res.status(StatusResponseConfig.ERROR).send({message: "Wrong request !!", code: StatusResponseConfig.NOT_FOUND_DATA});
        return;
    }

    // unfriend successfully
    try {
        const removedFriend = await Friend.remove({_id: friend_id});
        res.status(StatusResponseConfig.OK).send(removedFriend);
    }catch(error) {
        res.status(StatusResponseConfig.ERROR).send({message: error});
    }
};

/*
    GET LIST FRIEND
    - USER Id: string
 */
module.exports.getListFriend = async function(req, res, next)
{
    const userId = req.body.userId;

    // id is not valid
    if(!ObjectId.isValid(userId) ){
        res.status(StatusResponseConfig.ERROR).send({message: "Wrong id data !!", code: StatusResponseConfig.WRONG_DATA});
        return;
    }

    try {
        const listFriend_1 = await Friend.find({"user01": userId}).exec();
        const listFriend_2 = await Friend.find({"user02": userId}).exec();
        const listFriend = listFriend_1.concat(listFriend_2);

        res.status(StatusResponseConfig.OK).send(listFriend);
    }catch(error) {
        res.status(StatusResponseConfig.ERROR).send({message: error});
    }
};

