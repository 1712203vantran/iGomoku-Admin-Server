const Account = require('../models/Account.M');
const AccountConstant = require('../config/Account.Cfg');

module.exports.isAdminPermisssion = async function(accountId){
    const account = await Account.findById(accountId);

    if(account && account.permission === AccountConstant.PERMISSION_ADMIN)
        return true;
    return false;
}