const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const FacebookTokenStrategy = require('passport-facebook-token');

const config = require('./config.js');


//add specific strategy plugin to our passport implementation
//User.authenticate() is from User schema/model
exports.local = passport.use(new LocalStrategy(User.authenticate()));

//whenever we use sessions of passport, need to serialize
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

//configuration options
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //how token should be extracted - send it to us in the header
opts.secretOrKey = config.secretKey; //set to key we wrote in config.js

exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            //finds user document from jwt payload
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else { //no erorr, but also no user was found
                    return done(null, false);
                }
            });
        }
    )
);

//verifies that incoming request is from an authenticated user
//we're NOT using sessions, we're jusing jwt strategy
exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();
    } else {
        err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        return next(err);
    }
}

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }, 
        (accessToken, refreshToken, profile, done) => { //facebook provides the profile
            User.findOne({facebookId: profile.id}, (err, user) => { //look for matching facebook id
                if (err) {
                    return done(err, false);
                }
                //if user already exists in our database
                if (!err && user) {
                    return done(null, user);
                //if user DOESN'T exist in our database, let's create a user
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);