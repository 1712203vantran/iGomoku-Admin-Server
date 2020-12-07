const Account = require('../models/Account.M');
const Friend = require('../models/Friend.M');
const FriendInvitation = require('../models/FriendInvitation.M');

// config
const StatusResponseConfig = require('../config/StatusResponseConfig');

/*
    USER SEND MAKE FRIEND REQUEST
    - fromUser
    - toUser
 */
module.exports.sendMakingFriendRequest = async function(req, res, next)
{
    const fromUser_Id = req.body.fromUserId;
    const toUser_Id = req.body.toUserId;

    const fromUser = await Account.find({}).select({ "permission": 0, "_id": fromUser_Id});
    const toUser = await Account.find({}).select({ "permission": 0, "_id": toUser_Id});

    // Case one of fromUser or toUser is not exist (not included admin)
    if(!fromUser || !toUser){
        res.status.send(StatusResponseConfig.NOT_FOUND_DATA).send({});
    }

    const makingFriendRequest = new FriendInvitation({
        fromUser: fromUser,
        toUser: toUser,
        dateOfSendingInvitation: new Date()
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
    var invitationId = req.body.id;
    var userId = req.body.userId;
    var status = req.body.status;

    var invitation = await FriendInvitation.findById(invitationId);

    // if invitation not exist
    if(!invitation || invitation === {}){
        res.status(StatusResponseConfig.NOT_FOUND_DATA).send({});
        return;
    }

    // if user send action is not user receive invitation
    if(userId !== invitation.toUser){
        res.status(StatusResponseConfig.WRONG_REQUEST).send({});
        return;
    }

    if(status){
        // check they are friend before ???
        const fFriend1 = await Friend.find({}).select({"user01": invitation.fromUser, "user02": invitation.toUser});
        const fFriend2 = await Friend.find({}).select({"user01": invitation.toUser, "user02": invitation.fromUser});

        if(fFriend1 || fFriend2){
            res.status(StatusResponseConfig.FRIENDSHIP_EXISTED).send({});
            return;
        }


        // create new friendship
        const newFriend = new Friend({
            user01: invitation.fromUser,
            user02: invitation.toUser,
            dateOfMakingFriend: new Date()
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
    const friend_id = req.body.friend_id;
    const sender_id = req.body.userId;

    // check friend_id is existed ??
    var fFriend = await Friend.findById(friend_id);
    if(!fFriend || fFriend === [] || fFriend === {}){
        res.status(StatusResponseConfig.NOT_FOUND_DATA).send({});
        return;
    }

    // check sender is have permission ???
    var fSender = await Account.findById(sender_id);
    if(!fSender || fSender === [] || fSender === {}){
        res.status(StatusResponseConfig.NOT_FOUND_DATA).send({});
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

    try {
        const listFriend = await Friend.remove({"user01": userId});
        res.status(StatusResponseConfig.OK).send(listFriend);
    }catch(error) {
        res.status(StatusResponseConfig.ERROR).send({message: error});
    }
};

