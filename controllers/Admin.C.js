const Account = require('../models/Account.M');
const Utils = require('../utils/Utils');
const StatusConstant = require('../config/StatusResponseConfig');
const AccountConstant = require('../config/Account.Cfg');


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









