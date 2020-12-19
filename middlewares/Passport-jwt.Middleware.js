const JWTStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const StatusContans = require('../config/StatusResponseConfig');
const config = require('../config/JWT.Cfg');
const passport = require('passport');


passport.use('jwt', new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    secretOrKey   : config.secret,
    },
    function (jwtPayload, done) {
        
        return done(null, jwtPayload);
    }
));


