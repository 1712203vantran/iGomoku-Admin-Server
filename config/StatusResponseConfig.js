var StatusResponseConfig = {};

// 2xx
StatusResponseConfig.Ok = 200;
StatusResponseConfig.Created = 201;
StatusResponseConfig.Accpeted = 202;
StatusResponseConfig.No_Content = 204;

// 4xx Error
StatusResponseConfig.Error = 400;
StatusResponseConfig.Forbidden = 403;
StatusResponseConfig.Unauthorized = 403;
StatusResponseConfig.Not_Found = 404;


module.exports = StatusResponseConfig;