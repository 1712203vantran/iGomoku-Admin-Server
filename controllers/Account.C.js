const Account = require('../models/Account.M');

// config
const StatusResponseConfig = require('../config/StatusResponseConfig');

/*
    SIGN IN
    - Username
    - Password
    - Permission
 */
module.exports.signIn = async function(req, res, next)
{
    const username = req.body.username;
    const password = req.body.password;
    const permission = parseInt(req.body.permission);

    try {
        const account = await Account.find({}).select({ "username": username, "password": password, "permission": permission});
        if(account == null){
            res.status(StatusResponseConfig.NOT_FOUND_DATA).send();
        }else{
            res.status(StatusResponseConfig.OK).send(account);
        }
    }catch(error) {
        res.status(StatusResponseConfig.ERROR).send({message: error});
    }
};

/*
    SIGN UP ACCOUNT
    - Username
    - Password
    - Fullname
    - Permission
 */
module.exports.signUp = async function(req, res, next)
{
    // create new account
    const account = new Account({
        username: req.body.username,
        password: req.body.password,
        fullname: req.body.fullname,
        permission: parseInt(req.body.permission)
    });

    // check account is existed ?
    const f_account = await Account.find({}).select({"username": account.username});
    if(f_account){
        res.status(StatusResponseConfig.ACCOUNT_EXISTED).send({});
    }

    // create new account
    try{
        const savedAccount = await account.save();
        res.status(StatusResponseConfig.OK).send(savedAccount);
    } catch(error){
        res.status(StatusResponseConfig.ERROR).send({message: error});
    }
};


/*
    UPDATE INFO PROFILE
    - Fullname
    (Version 1.0)
 */
module.exports.updateProfile = async function(req, res, next)
{
    const id = req.body.userId;
    const username = req.body.username;
    const password = req.body.password;
    const fullname = req.body.fullname;

    try {
        const updatedProfile = await Account.updateOne(
            {_id: id},
            { $set: 
                {
                    fullname: fullname,
                }
            }
        );
        res.status(StatusResponseConfig.OK).send(updatedProfile);
    }catch(error) {
        res.status(StatusResponseConfig.ERROR).send({message: error});
    }
};


/* 
    CHANGE PASSWORD
 */
module.exports.changePassword = async function(req, res, next)
{
    const id = req.body.userId;
    const username = req.body.username;
    const password = req.body.password;
    const newPassword = req.body.newPassword;

    const account = await Account.findById(id);

    // case user input old password wrong
    if(account.password !== password){
        res.status(StatusResponseConfig.WRONG_PASSWORD).send({});
    }

    try {
        const changedPassword = await Account.updateOne(
            {_id: id},
            { $set: 
                {
                    password: newPassword
                }
            }
        );
        res.status(StatusResponseConfig.OK).send(changedPassword);
    }catch(error) {
        res.status(StatusResponseConfig.ERROR).send({message: error});
    }
};



