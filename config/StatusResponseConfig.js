var StatusResponseConfig = {};

// common
StatusResponseConfig.OK = 200;
StatusResponseConfig.NOT_FOUND_DATA = 201;
StatusResponseConfig.ERROR = 400;
StatusResponseConfig.NOT_HAVE_PERMISSION = 203;

// account
StatusResponseConfig.ACCOUNT_EXISTED = 1000;
StatusResponseConfig.ACCOUNT_NOT_EXISTED = 1001;
StatusResponseConfig.WRONG_PASSWORD = 1002;
StatusResponseConfig.WRONG_REQUEST = 1003;

// friend
StatusResponseConfig.FRIENDSHIP_EXISTED = 1100;


module.exports = StatusResponseConfig;