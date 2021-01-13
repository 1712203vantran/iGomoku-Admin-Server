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

module.exports.formatDate = function (today) {
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;

    return today;
};

module.exports.parseDateTime = function (dateSting) {
    let seperator = "/";
    let date = new Date( Date.parse(dateSting) );
    return [("0" + date.getDate()).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join(seperator) + ' ' + [("0" + date.getHours()).slice(-2), ("0" + date.getMinutes()).slice(-2)].join(':');
};