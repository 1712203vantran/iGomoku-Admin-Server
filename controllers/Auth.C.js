
const EmailSender = require('../config/nodemailer');
//const sendResetPasswordMail = require('../config/nodemailer');
const Account = require('../models/Account.M');
const jwtCfg = require('../config/JWT.Cfg');
const jwt = require("jsonwebtoken");
// config
const StatusResponseConfig = require('../config/StatusResponseConfig');
const { realTimeActions } = require('../socket.io');

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
    const socketID = req.body.socketID;

    try {
        const account = await Account.findOne({ "username": username, "password": password, "permission": permission}).exec();
        if(!account){
            res.status(StatusResponseConfig.Error).send({message: "Account is not exist!"});
        }
        else if (account.accountStatus === 1 || account.accountStatus === 2) {// account blocked
            res.status(StatusResponseConfig.Error).send({message: "Account is blocked"});
        }
        else{// Login successfully
            var payload = { userID: account._id };
            var token = jwt.sign(payload, jwtCfg.secret);
            //realtime when new user signin to server
            realTimeActions.updateOnlineUserList(account, socketID);

            res.status(StatusResponseConfig.Ok).json({
                token: token,
                account: account
              });
        }
    }catch(error) {
        console.log({error});
        res.status(StatusResponseConfig.Error).send({message: error});
    }
};

module.exports.signInGoogle = async function(req, res, next)
{
    const username = req.body.username;
    const fullname = req.body.fullname;
    const email = req.body.email;
    const socketID = req.body.socketID;
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
            email: email,
            permission: permission
        });

        const savedAccount = await newAccount.save();
        var payload = { userID: savedAccount._id };
        var token = jwt.sign(payload, jwtCfg.secret);
        //cập nhật danh sách người dùng đang online
        realTimeActions.updateOnlineUserList(savedAccount, socketID);

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
    const email = req.body.email;
    //const token = req.body.token;
    const socketID = req.body.socketID;
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
            email: email,
            permission: permission
        });

        const savedAccount = await newAccount.save();
        var payload = { userID: savedAccount._id };
        var token = jwt.sign(payload, jwtCfg.secret);
         //cập nhật danh sách người dùng đang online
         realTimeActions.updateOnlineUserList(savedAccount, socketID);

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
    - Email
    - Permission
 */
module.exports.signUp = async function(req, res, next)
{
    // create new account
    const account = new Account({
        username: req.body.username,
        password: req.body.password,
        fullname: req.body.fullname,
        email: req.body.email,
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
    - Email
    (Version 1.0)
 */
module.exports.updateProfile = async function(req, res, next)
{
    const id = req.body.userId;
    const fullname = req.body.fullname;

    try {
        const updatedProfile = await Account.updateOne(
            {_id: id},
            { $set: 
                {
                    fullname: fullname
                }
            }
        );
        res.status(StatusResponseConfig.Ok).send(updatedProfile);
    }catch(error) {
        res.status(StatusResponseConfig.Error).send({message: error});
    }
};


module.exports.getProfile = async function(req, res, next)
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
    CHANGE PASSWORD
 */
module.exports.changePassword = async function(req, res, next)
{
    const id = req.body.userId;
    const password = req.body.password;
    const newPassword = req.body.newPassword;

    const account = await Account.findById(id);

    // case user input old password wrong
    console.log(password);
    console.log(account.password);
    if(account.password !== password){
        console.log("wrong password");
        res.status(StatusResponseConfig.Error).send({message: "Password is wrong"});
        return;
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

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
// user bấm send verify email 
// => Gọi api => api validate email và gửi email chứa link nhúng token 
// => click vào link dẫn đến trang confirm ở FE => gọi api đã xác thực email 
module.exports.sendVerifyEmail = async function(req, res, next)
{
    const id = req.body.userId;
    const jwtToken = req.body.jwtToken;

    try {
        const account = await Account.findOne({ "_id": id}).exec();
        if(!account){
            res.status(StatusResponseConfig.Error).send({message: "Account is not exist!"});
        }
        else if (!validateEmail(account.email)) {
            res.status(StatusResponseConfig.Error).send({message: "Invalid email address"});
        }
        else if (account.accountStatus === 0 || account.accountStatus === 2) {
            res.status(StatusResponseConfig.Error).send({message: "Account had already been verified"});
        }
        else{// send email
            const email = account.email;
            const userID = id;
            const token = jwtToken;
///////////////////////////////////////////////////////////////////////////////////////
            const secret = await jwt.sign(
                {
                    userID,
                    token,
                },
                jwtCfg.secret,
                {
                expiresIn: '900000',
                }
            );
            try {
                const mail = await EmailSender.sendMailActiveAccount({
                    receiverEmail: email,
                    link: `${process.env.USERURL}/verify-email/${secret}`,
                });
                res.send(mail);
                res.status(StatusResponseConfig.Ok);
            }
            catch (e) {
                res.status(StatusResponseConfig.Error).send({message: "Cannot send email to verify"});
            }
//////////////////////////////////////////////////////////////////////////////////////////
        }
    }catch(error) {
        console.log({error});
        res.status(StatusResponseConfig.Error).send({message: error});
    }
};


module.exports.verifiedEmail = async function(req, res, next)
{
    const id = req.body.userId;
    const decodekey = req.body.decodekey;

    try {
        jwt.verify(decodekey, jwtCfg.secret, (err, decoded) => {
            if (err) {
                res.status(StatusResponseConfig.Error).send({message: "Cannot verify email"});
            }
            const uID1 = id;
            const uID2 = decoded.userID;
            jwt.verify(decoded.token, jwtCfg.secret, async (err2, decodedToken) => {
                if (err2) {
                    res.status(StatusResponseConfig.Error).send({message: "Cannot verify email"});
                }
                const uID3 = decodedToken.userID;
                if (uID1 === uID2 && uID2 === uID3) { //really exactly
                    ///// cập nhật account status trong DB
                    const profile = await Account.findById(uID1);
                    let newAccountStatus = ((profile.accountStatus === -1) ? 0 : (profile.accountStatus === 1 ? 2 : profile.accountStatus));
                    try {
                        const updatedStatusAccount = await Account.updateOne(
                            {_id: uID1},
                            { $set: 
                                {
                                    accountStatus: newAccountStatus,
                                }
                            }
                        );
                        res.status(StatusResponseConfig.Ok).send("Successful");
                    } catch(error) {
                        res.status(StatusResponseConfig.Error).send({message: error});
                    }
                }
            });
        });
    }catch(error) {
        console.log({error});
        res.status(StatusResponseConfig.Error).send({message: error});
    }
};

function makeRandomPassword(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
// Nhập username và email => api Validate thông tin, nếu đúng thì gửi email chứa random password, ko thì báo lỗi
module.exports.sendResetPasswordEmail = async function(req, res, next)
{
    const username = req.body.username;
    const email = req.body.email;

    try {
        const account = await Account.findOne({ "username": username}).exec();
        if(!account){
            res.status(StatusResponseConfig.Error).send({message: "Account is not exist!"});
        }
        else if (account.accountStatus === -1 || account.accountStatus === 1) {
            res.status(StatusResponseConfig.Error).send({message: "We're sorry but your account hasn't been verified to use this feature yet"});
        }
        else if (account.email !== email) {
            res.status(StatusResponseConfig.Error).send({message: "Wrong authenticate email information"});
        }
        else{// send email
            const userID = account._id;
            //const newPassword = "newPassword";
            const newPassword = makeRandomPassword(8);
            
            ////////// cập nhật password mới vào DB
            try {
                const changedPassword = await Account.updateOne(
                    {_id: userID},
                    { $set: 
                        {
                            password: newPassword
                        }
                    }
                );
            }catch(error) {
                res.status(StatusResponseConfig.Error).send({message: error});
            }
///////////////////////////////////////////////////////////////////////////////////////
            try {
                const mail = await EmailSender.sendResetPasswordMail({
                    receiverEmail: email,
                    newPassword: newPassword,
                });
                res.send(mail);
                res.status(StatusResponseConfig.Ok);
            }
            catch (e) {
                res.status(StatusResponseConfig.Error).send({message: "Cannot send email to reset password"});
            }
//////////////////////////////////////////////////////////////////////////////////////////
        }
    }catch(error) {
        console.log({error});
        res.status(StatusResponseConfig.Error).send({message: error});
    }
};