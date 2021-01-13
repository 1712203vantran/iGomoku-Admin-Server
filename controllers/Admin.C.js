const Account = require('../models/Account.M');
const Utils = require('../utils/Utils');
const StatusConstant = require('../config/StatusResponseConfig');
const AccountConstant = require('../config/Account.Cfg');
const StatusResponseConfig = require('../config/StatusResponseConfig');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const History = require('../models/HistoryGame.M');
const Friend = require('../models/Friend.M');
const Board = require('../models/Board.M');


module.exports.getListUser = async function(req, res, next){
    // return list user
    try {
        const listUser = await Account.find({"permission": AccountConstant.PERMISSION_USER}).exec();
        res.status(StatusConstant.Ok).send(listUser);
    }catch(error) {
        res.status(StatusConstant.Error).send({message: error});
    }
}


module.exports.settingUserAccessing =  async function(req, res, next){
    const adminId = req.body.adminId;
    const userId = req.body.userId;
    const status = parseInt(req.body.status);

    if(!Utils.isAdminPermisssion(adminId)){
        res.status(StatusConstant.Error).send({message: "Must be admin !!"});
        return;
    }

    try {
        const updatedStatusAccount = await Account.updateOne(
            {_id: userId},
            { $set: 
                {
                    accountStatus: status,
                }
            }
        );
        res.status(StatusConstant.Ok).send(updatedStatusAccount);
    }catch(error) {
        res.status(StatusConstant.Error).send({message: error});
    }
}

module.exports.getUserProfile = async function(req, res, next)
{
    const id = req.query.userId;

    try {
        const profile = await Account.findById(id);
        res.status(StatusResponseConfig.Ok).send(profile);
    }catch(error) {
        res.status(StatusResponseConfig.Error).send({message: error});
    }
};


/*
    GET LIST HISTORY
    - USER Id: string
 */
module.exports.getListHistory = async function (req, res, next) {
    const userId = req.query.userId;
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
    GET LIST FRIEND
    - USER Id: string
 */
module.exports.getListFriend = async function (req, res, next) {
    const userId = req.query.userId;
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
        console.log(`[GetListFriend] - Success: friends ${listFriend.length}`);
    } catch (error) {
        res.status(StatusResponseConfig.Error).send({ message: error });
        console.log(`[GetListFriend] - Error: ${error}`);
    }
};

/*
    GET HISTORY
    - History Id: string
 */
module.exports.getHistory = async function (req, res, next) {
    const historyID = req.query.historyID;
    const userID = req.query.userID;
    //const userID = req.user.userID;

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

