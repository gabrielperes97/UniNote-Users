let passport = require("passport");
let passportJWT = require("passport-jwt");
let mongoose = require('mongoose');
let User = mongoose.model('Users');
config = require('./'+ (process.env.NODE_ENV || "dev") + ".json");

let ExtractJwt = passportJWT.ExtractJwt;
let Strategy = passportJWT.Strategy;

let params = {
    secretOrKey: config.jwtSecret,
    jwtFromRequest: ExtractJwt.fromHeader('authorization')
};

module.exports = function() {
    let strategy = new Strategy(params, function(payload, done){
        return User.findById(payload.id).exec((err, user) => {
            if (user)
                return done(null, user);
            else
                return done(new Error("User not found"), null);
        });
    });
    passport.use(strategy);
    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", config.jwtSession);
        }
    };
};