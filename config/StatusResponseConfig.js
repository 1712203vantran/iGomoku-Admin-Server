var StatusResponseConfig = {};

// common
StatusResponseConfig.OK = 200;
StatusResponseConfig.NOT_FOUND_DATA = 201;
StatusResponseConfig.ERROR = 202;

// account
StatusResponseConfig.ACCOUNT_EXISTED = 1000;
StatusResponseConfig.WRONG_PASSWORD = 1001;
StatusResponseConfig.WRONG_REQUEST = 1002;

// friend
StatusResponseConfig.FRIENDSHIP_EXISTED = 1100;


module.exports = StatusResponseConfig;