const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Account = require('../models/Account.M');
const Friend = require('../models/Friend.M');
const Payment = require('../models/Payment.M');
const History = require('../models/HistoryGame.M');
const FriendInvitation = require('../models/FriendInvitation.M');
const Utils = require('../utils/Utils');

// config
const StatusResponseConfig = require('../config/StatusResponseConfig');
const AccountConstants = require('../config/Account.Cfg');
const Board = require('../models/Board.M');

/*
    USER SEND MAKE FRIEND REQUEST
    - fromUser
    - toUser
 */
module.exports.sendMakingFriendRequest = async function (req, res, next) {
    const fromUser_Id = req.body.fromUserId;
    const toUser_Id = req.body.toUserId;

    // id is not valid
    if (!ObjectId.isValid(fromUser_Id) || !ObjectId.isValid(toUser_Id)) {
        res.status(StatusResponseConfig.Error).send({ message: "Wrong id data !!" });
        console.log(`[SendMakingFriendRequest] - User ID is not valid: ${fromUser_Id} - ${toUser_Id}`);
        return;
    }

    const fromUser = await Account.findOne({ "_id": fromUser_Id, "permission": AccountConstants.PERMISSION_USER }).exec();
    const toUser = await Account.findOne({ "_id": toUser_Id, "permission": AccountConstants.PERMISSION_USER }).exec();

    // Case one of fromUser or toUser is not exist (not included admin)
    if (!fromUser || !toUser) {
        res.status(StatusResponseConfig.Error).send({ message: "Wrong request !!" });
        console.log(`[SendMakingFriendRequest] - User is not existed: ${fromUser_Id} - ${toUser_Id}`);
        return;
    }

    // case invitation is existed
    const f_Invitation = await FriendInvitation.findOne({ "fromUser": fromUser_Id, "toUser": toUser_Id }).exec();
    if (f_Invitation) {
        res.status(StatusResponseConfig.Error).send({ message: "FriendInvitation is existed !!" });
        console.log(`[SendMakingFriendRequest] - Invitation is  existed: ${f_Invitation}`);
        return;
    }

    const makingFriendRequest = new FriendInvitation({
        fromUser: fromUser_Id,
        toUser: toUser_Id
    });

    try {
        const savedInvitation = await makingFriendRequest.save();
        res.status(StatusResponseConfig.Ok).send(savedInvitation);
        console.log(`[SendMakingFriendRequest] - Success - Invitation: ${savedInvitation}`);
    } catch (error) {
        res.status(StatusResponseConfig.Error).send({ message: error });
        console.log(`[SendMakingFriendRequest] - Error - Invitation: ${error}`);
    }
};

/*
    ACCEPT OR REFUSE FRIEND INVITATION  
    - id (id of invitation)
    - userId (who send this request)
    - status (true: accept, false: refuse)
 */
module.exports.processingFriendInvitation = async function (req, res, next) {
    var invitationId = req.body.invitationId;
    var userId = req.body.userId; // receiver
    var status = req.body.status;

    // id is not valid
    if (!ObjectId.isValid(invitationId) || !ObjectId.isValid(userId)) {
        res.status(StatusResponseConfig.Error).send({ message: "Wrong id data !!" });
        console.log(`[ProcessingFriendInvitation] - Wrong Id: {userId-${invitationId}} {invitationId-${userId}} `);
        return;
    }

    var invitation = await FriendInvitation.findById(invitationId).exec();

    // if invitation not exist
    if (!invitation) {
        res.status(StatusResponseConfig.Error).send({ message: "This FriendInvitation is not existed !!" });
        console.log(`[ProcessingFriendInvitation] - Invitation is not existed: ${invitationId}`);
        return;
    }

    // if user send action is not user receive invitation
    if (userId !== invitation.toUser) {
        res.status(StatusResponseConfig.Error).send({ message: "User send request must be user received friend invitation !!" });
        console.log(`[ProcessingFriendInvitation] - Wrong Data: ${invitationId}`);
        return;
    }

    const listFriend = [];
    if (status) {
        // check they are friend before ???
        const fFriend1 = await Friend.findOne({ "user01": invitation.fromUser, "user02": invitation.toUser }).exec();
        const fFriend2 = await Friend.findOne({ "user01": invitation.toUser, "user02": invitation.fromUser }).exec();

        if (fFriend1 || fFriend2) {
            res.status(StatusResponseConfig.Error).send({ message: "They are friend before !!" });
            console.log(`[ProcessingFriendInvitation]- Error - They are friend before`);
            return;
        }

        // create new friendship
        const newFriend = new Friend({
            user01: invitation.fromUser,
            user02: invitation.toUser
        });

        // delete invitation
        try {
            const removedInvitation = await FriendInvitation.remove({ _id: invitationId });
            console.log(`[ProcessingFriendInvitation] - Delete Invitation: ${invitationId}`);
        } catch (error) {
            console.log("[ProcessingFriendInvitation] - Error delete invitation msg: " + error);
        }


        try {
            const savedFriend = await newFriend.save();
            const result = [];
            const listInvitation = await FriendInvitation.find({ "toUser": userId }).exec();

            // new list invitation
            for (var i = 0; i < listInvitation.length; i++) {
                var fromUser = await Account.findById(listInvitation[i]['fromUser']);
                result[i] = {};
                result[i]._id = listInvitation[i]['_id'];
                result[i].time = Utils.formatDate(listInvitation[i]['dateOfSendingInvitation']);
                if (fromUser) {
                    result[i].fromUser = fromUser['fullname'];
                    result[i].fromUser_email = fromUser['email'];
                    result[i].fromUser_elo = fromUser['elo'];
                    result[i].fromUser_xu = fromUser['xu'];
                }
                else {
                    result[i].fromUser = "No Name";
                    result[i].fromUser_email = "No Email";
                    result[i].fromUser_elo = 0;
                    result[i].fromUser_xu = 0;
                }
            }

            // new listFriend
            const listFriend_1 = await Friend.find({ "user01": userId }).exec();
            const listFriend_2 = await Friend.find({ "user02": userId }).exec();
            for (var i = 0; i < listFriend_1.length; i++) {
                var others = await Account.findById(listFriend_1[i]['user02']);
                listFriend.push(others);
            }
            for (var i = 0; i < listFriend_2.length; i++) {
                var others = await Account.findById(listFriend_2[i]['user01']);
                listFriend.push(others);
            }

            res.status(StatusResponseConfig.Ok).send({ listFriend: listFriend, listInvitation: result });
            console.log(`[ProcessingFriendInvitation] - Success: ${savedFriend}`);
        } catch (error) {
            res.status(StatusResponseConfig.Error).send({ message: error });
            console.log(`[ProcessingFriendInvitation] - Error: ${error}`);
        }
    }
    else {
        // todo:
        // delete invitation
        try {
            const removedInvitation = await FriendInvitation.remove({ _id: invitationId });
            console.log(`[ProcessingFriendInvitation] - Delete Invitation: ${invitationId}`);
        } catch (error) {
            console.log("[ProcessingFriendInvitation] - Error delete invitation msg: " + error);
        }

        // new listFriend
        const listFriend_1 = await Friend.find({ "user01": userId }).exec();
        const listFriend_2 = await Friend.find({ "user02": userId }).exec();
        for (var i = 0; i < listFriend_1.length; i++) {
            var others = await Account.findById(listFriend_1[i]['user02']);
            listFriend.push(others);
        }
        for (var i = 0; i < listFriend_2.length; i++) {
            var others = await Account.findById(listFriend_2[i]['user01']);
            listFriend.push(others);
        }

        // new list invitaion
        const result = [];
        const listInvitation = await FriendInvitation.find({ "toUser": userId }).exec();

        for (var i = 0; i < listInvitation.length; i++) {
            var fromUser = await Account.findById(listInvitation[i]['fromUser']);
            result[i] = {};
            result[i]._id = listInvitation[i]['_id'];
            result[i].time = Utils.formatDate(listInvitation[i]['dateOfSendingInvitation']);
            if (fromUser) {
                result[i].fromUser = fromUser['fullname'];
                result[i].fromUser_email = fromUser['email'];
                result[i].fromUser_elo = fromUser['elo'];
                result[i].fromUser_xu = fromUser['xu'];
            }
            else {
                result[i].fromUser = "No Name";
                result[i].fromUser_email = "No Email";
                result[i].fromUser_elo = 0;
                result[i].fromUser_xu = 0;
            }
        }
        res.status(StatusResponseConfig.Ok).send({ listFriend: listFriend, listInvitation: result });
    }

    // delete invitation
    // try {
    //     const removedInvitation = await FriendInvitation.remove({_id: invitationId});
    //     console.log(`[ProcessingFriendInvitation] - Delete Invitation: ${invitationId}`);
    // }catch(error) {
    //     console.log("[ProcessingFriendInvitation] - Error delete invitation msg: " + error);
    // }
};


/*
    UNFRIEND
    - Friend Id: string
    - Sender: string (user send this request)
 */
module.exports.unFriend = async function (req, res, next) {
    const playerId = req.body.playerId;
    const senderId = req.body.userId;

    console.log("fdfsdfsd");

    // id is not valid
    if (!ObjectId.isValid(senderId) || !ObjectId.isValid(playerId)) {
        res.status(StatusResponseConfig.Error).send({ message: "Wrong Id data !!" });
        console.log(`[UnFriend] - Wrong Id: {sender-${senderId}} {friend-${playerId}} `);
        return;
    }

    // check friend_id is existed ??
    var fFriend = await Friend.findOne({ user01: senderId, user02: playerId }).exec();
    if (!fFriend) {
        fFriend = await Friend.findOne({ user01: playerId, user02: senderId }).exec();
    }
    if (!fFriend) {
        res.status(StatusResponseConfig.Error).send({ message: "FriendShip is not existed !!" });
        console.log(`[UnFriend] - Error - Friendship is not existed - ${fFriend}`);
        return;
    }


    // unfriend successfully
    try {
        const removedFriend = await Friend.remove({ _id: fFriend._id });

        // new listFriend
        const listFriend = [];
        const listFriend_1 = await Friend.find({ "user01": senderId }).exec();
        const listFriend_2 = await Friend.find({ "user02": senderId }).exec();
        for (var i = 0; i < listFriend_1.length; i++) {
            var others = await Account.findById(listFriend_1[i]['user02']);
            listFriend.push(others);
        }
        for (var i = 0; i < listFriend_2.length; i++) {
            var others = await Account.findById(listFriend_2[i]['user01']);
            listFriend.push(others);
        }

        res.status(StatusResponseConfig.Ok).send(listFriend);
        console.log(`[UnFriend] - Success: ${removedFriend}`);
    } catch (error) {
        res.status(StatusResponseConfig.Error).send({ message: error });
        console.log(`[UnFriend] - Error: ${error}`);
    }
};

/*
    GET LIST FRIEND INVITATION
    - USER Id: string
 */
module.exports.getListFriendInvitation = async function (req, res, next) {
    const userId = req.user.userID;
    // id is not valid
    if (!ObjectId.isValid(userId)) {
        res.status(StatusResponseConfig.Error).send({ message: "Wrong id data !!" });
        console.log(`[GetListFriendInvitation] - Wrong Id - UserId: ${userId}`);
        return;
    }

    try {
        const result = [];
        const listInvitation = await FriendInvitation.find({ "toUser": userId }).exec();

        for (var i = 0; i < listInvitation.length; i++) {
            var fromUser = await Account.findById(listInvitation[i]['fromUser']);
            result[i] = {};
            result[i]._id = listInvitation[i]['_id'];
            result[i].time = Utils.formatDate(listInvitation[i]['dateOfSendingInvitation']);
            if (fromUser) {
                result[i].fromUser = fromUser['fullname'];
                result[i].fromUser_email = fromUser['email'];
                result[i].fromUser_elo = fromUser['elo'];
                result[i].fromUser_xu = fromUser['xu'];
            }
            else {
                result[i].fromUser = "No Name";
                result[i].fromUser_email = "No Email";
                result[i].fromUser_elo = 0;
                result[i].fromUser_xu = 0;
            }
        }


        res.status(StatusResponseConfig.Ok).send(result);
        console.log(`[GetListFriendInvitation] - Success: ${listInvitation}`);
    } catch (error) {
        res.status(StatusResponseConfig.Error).send({ message: error });
        console.log(`[GetListFriendInvitation] - Error: ${error}`);
    }
};


/*
    GET LIST FRIEND
    - USER Id: string
 */
module.exports.getListFriend = async function (req, res, next) {
    const userId = req.user.userID;
    // id is not valid
    if (!ObjectId.isValid(userId)) {
        res.status(StatusResponseConfig.Error).send({ message: "Wrong id data !!" });
        console.log(`[GetListFriend] - Wrong Id - UserId: ${userId}`);
        return;
    }

    try {
        const listFriend_1 = await Friend.find({ "user01": userId }).exec();
        const listFriend_2 = await Friend.find({ "user02": userId }).exec();
        const listFriend = [];

        for (var i = 0; i < listFriend_1.length; i++) {
            var others = await Account.findById(listFriend_1[i]['user02']);
            listFriend.push(others);
        }

        for (var i = 0; i < listFriend_2.length; i++) {
            var others = await Account.findById(listFriend_2[i]['user01']);
            listFriend.push(others);
        }

        res.status(StatusResponseConfig.Ok).send(listFriend);
        console.log(`[GetListFriend] - Success: ${listFriend}`);
    } catch (error) {
        res.status(StatusResponseConfig.Error).send({ message: error });
        console.log(`[GetListFriend] - Error: ${error}`);
    }
};

/*
    GET LIST PAYMENT
    - USER Id: string
 */
module.exports.getListPayment = async function (req, res, next) {
    const userId = req.user.userID;
    // id is not valid
    if (!ObjectId.isValid(userId)) {
        res.status(StatusResponseConfig.Error).send({ message: "Wrong id data !!" });
        console.log(`[GetListPayment] - Wrong Id - UserId: ${userId}`);
        return;
    }

    try {
        const listPayment = await Payment.find({ "userId": userId }).exec();

        res.status(StatusResponseConfig.Ok).send(listPayment);
        console.log(`[GetListPayment] - Success: ${listPayment}`);
    } catch (error) {
        res.status(StatusResponseConfig.Error).send({ message: error });
        console.log(`[GetListPayment] - Error: ${error}`);
    }
};

/*
    GET LIST HISTORY
    - USER Id: string
 */
module.exports.getListHistory = async function (req, res, next) {
    const userId = req.user.userID;
    // id is not valid
    if (!ObjectId.isValid(userId)) {
        res.status(StatusResponseConfig.Error).send({ message: "Wrong id data !!" });
        console.log(`[GetListHistory] - Wrong Id - UserId: ${userId}`);
        return;
    }

    try {
        const listHistory_1 = await History.find({ "ownerID": userId }).exec();
        const listHistory_2 = await History.find({ "playerID": userId }).exec();
        const listHistory = [];

        for (var i = 0; i < listHistory_1.length; i++) {
            var element = {};
            element._id = listHistory_1[i]._id;
            element.me_fullname = (await Account.findById(listHistory_1[i].ownerID))["fullname"];
            element.me_id = listHistory_1[i].ownerID;
            element.enemy_fullname = (await Account.findById(listHistory_1[i].playerID))["fullname"];
            element.enemy_id = listHistory_1[i].playerID;
            element.result = listHistory_1[i].result === 1 ? 1 : 0;
            element.chats = listHistory_1[i].messages;
            element.stepHistory = listHistory_1[i].history;
            element.time = Utils.parseDateTime(listHistory_1[i].createdTime);

            listHistory.push(element);
        }

        for (var i = 0; i < listHistory_2.length; i++) {
            var element = {};
            element._id = listHistory_2[i]._id;
            element.enemy_fullname = await Account.findById(listHistory_2[i].ownerID).exec()['fullname'];
            element.enemy_id = listHistory_2[i].ownerID;
            element.me_fullname = await Account.findById(listHistory_2[i].playerID).exec()['fullname'];
            element.me_id = listHistory_2[i].playerID;
            element.result = listHistory_2[i].result === 2 ? 1 : 0;
            element.chats = listHistory_2[i].messages;
            element.stepHistory = listHistory_2[i].history;
            element.time = Utils.parseDateTime(listHistory_2[i].createdTime);

            listHistory.push(element);
        }

        // console.log(listHistory);

        res.status(StatusResponseConfig.Ok).send(listHistory);
        console.log(`[GetListHistory] - Success: ${listHistory}`);
    } catch (error) {
        res.status(StatusResponseConfig.Error).send({ message: error });
        console.log(`[GetListHistory] - Error: ${error}`);
    }
};

/*
    GET HISTORY
    - History Id: string
 */
module.exports.getHistory = async function (req, res, next) {
    const historyID = req.query.historyID;
    const userID = req.user.userID;

    // id is not valid
    if (!ObjectId.isValid(historyID)) {
        res.status(StatusResponseConfig.Error).send({ message: "Wrong id data !!" });
        console.log(`[GetHistory] - Wrong Id - HistoryID: ${historyID}`);
        return;
    }

    try {
        const history = await History.findById(historyID);
        const result = {};

        if (history['ownerID'] === userID) {
            result.enemy_fullname = (await Account.findById(history.playerID))['fullname'];
            result.enemy_id = history.ownerID;
            result.me_fullname = (await Account.findById(history.ownerID))['fullname'];
            result.me_id = history.playerID;
            result.result = history.result === 1 ? 1 : 0;
        }
        else {
            result.enemy_fullname = (await Account.findById(history.ownerID))['fullname'];
            result.enemy_id = history.ownerID;
            result.me_fullname = (await Account.findById(history.playerID))['fullname'];
            result.me_id = history.playerID;
            result.result = history.result === 2 ? 1 : 0;
        }

        result.chats = history.messages;
        result.stepHistory = history.history;
        result.time = Utils.formatDate(history.createdTime);
        result.eloGot = history.eloGot;
        result.boardName = (await Board.findById(history.boardID))['boardName'];
        result.winningLine = history.winningLine;

        console.log("result ne: " + JSON.stringify(result));

        res.status(StatusResponseConfig.Ok).send(result);
        console.log(`[GetHistory] - Success: ${result}`);
    } catch (error) {
        res.status(StatusResponseConfig.Error).send({ message: error });
        console.log(`[GetHistory] - Error: ${error}`);
    }
};