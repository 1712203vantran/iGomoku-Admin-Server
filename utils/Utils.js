const Account = require('../models/Account.M');
const AccountConstant = require('../config/Account.Cfg');

module.exports.isAdminPermisssion = async function (accountId) {
    const account = await Account.findById(accountId);

    if (account && account.permission === AccountConstant.PERMISSION_ADMIN)
        return true;
    return false;
};

module.exports.getCurrentDate = function () {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    return today;
};