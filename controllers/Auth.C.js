const Account = require('../models/Account.M');
const jwtCfg = require('../config/JWT.Cfg');
const jwt = require("jsonwebtoken");

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
        const account = await Account.findOne({ "username": username, "password": password, "permission": permission}).exec();
        if(!account){
            res.status(StatusResponseConfig.Error).send({message: "Account is not exist!"});
        }else{// Login successfully
            var payload = { userID: account._id };
            var token = jwt.sign(payload, jwtCfg.secret);
            res.status(StatusResponseConfig.Ok).json({
                token: token,
                account: account
              });
        }
    }catch(error) {
        res.status(StatusResponseConfig.Error).send({message: error});
    }
};

module.exports.signInGoogle = async function(req, res, next)
{
    const username = req.body.username;
    const fullname = req.body.fullname;
    //const token = req.body.token;
    const password = "google";
    const permission = parseInt(req.body.permission);

    //TODO: xác thực token
    
    // check account is existed ?
    try{
        const f_account = await Account.findOne({'username': username }).exec();
        if(f_account){  // account existed, check password
            const account = await Account.findOne({ "username": username, "password": password, "permission": permission}).exec();
            if(!account){
                res.status(StatusResponseConfig.Error).send({message: "Wrong login information!"});
            }else{// Login successfully
                var payload = { userID: account._id };
                var token = jwt.sign(payload, jwtCfg.secret);
                res.status(StatusResponseConfig.Ok).json({
                    token: token,
                    account: account
                });
            }
            return;
        }
    } catch(error){
        res.status(StatusResponseConfig.Error).send({message: error});
        return;
    }

    // create new account
    try{
        const newAccount = new Account({
            username: username,
            password: password,
            fullname: fullname,
            permission: permission
        });

        const savedAccount = await newAccount.save();
        var payload = { userID: savedAccount._id };
        var token = jwt.sign(payload, jwtCfg.secret);

        res.status(StatusResponseConfig.Ok).json({
            token: token,
            savedAccount: savedAccount
        });
    } catch(error){
        res.status(StatusResponseConfig.Error).send({message: error});
    }
};

module.exports.signInFacebook = async function(req, res, next)
{
    const username = req.body.username;
    const fullname = req.body.fullname;
    //const token = req.body.token;
    const password = "facebook";
    const permission = parseInt(req.body.permission);

    //TODO: xác thực token
    
    // check account is existed ?
    try{
        const f_account = await Account.findOne({'username': username }).exec();
        if(f_account){  // account existed, check password
            const account = await Account.findOne({ "username": username, "password": password, "permission": permission}).exec();
            if(!account){
                res.status(StatusResponseConfig.Error).send({message: "Wrong login information!"});
            }else{ // Login successfully
                var payload = { userID: account._id };
                var token = jwt.sign(payload, jwtCfg.secret);
                res.status(StatusResponseConfig.Ok).json({
                    token: token,
                    account: account
                });
            }
            return;
        }
    } catch(error){
        res.status(StatusResponseConfig.Error).send({message: error});
        return;
    }

    // create new account
    try{
        const newAccount = new Account({
            username: username,
            password: password,
            fullname: fullname,
            permission: permission
        });

        const savedAccount = await newAccount.save();
        var payload = { userID: savedAccount._id };
        var token = jwt.sign(payload, jwtCfg.secret);

        res.status(StatusResponseConfig.Ok).json({
            token: token,
            savedAccount: savedAccount
        });
    } catch(error){
        res.status(StatusResponseConfig.Error).send({message: error});
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
    try{
        const f_account = await Account.findOne({'username': req.body.username }).exec();
        if(f_account){
            res.status(StatusResponseConfig.Error).send({message: "Account is existed"});
            return;
        }
    } catch(error){
        res.status(StatusResponseConfig.Error).send({message: error});
        return;
    }

    // create new account
    try{
        const savedAccount = await account.save();
        var payload = { userID: savedAccount._id };
        var token = jwt.sign(payload, jwtCfg.secret);

        res.status(StatusResponseConfig.Ok).send({
            token: token, 
            savedAccount: savedAccount
        });
    } catch(error){
        res.status(StatusResponseConfig.Error).send({message: error});
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
        res.status(StatusResponseConfig.Ok).send(updatedProfile);
    }catch(error) {
        res.status(StatusResponseConfig.Error).send({message: error});
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
        res.status(StatusResponseConfig.Error).send({message: "Password is wrong"});
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
        res.status(StatusResponseConfig.Ok).send(changedPassword);
    }catch(error) {
        res.status(StatusResponseConfig.Error).send({message: error});
    }
};



