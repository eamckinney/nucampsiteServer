const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

//add specific strategy plugin to our passport implementation
//User.authenticate() is from User schema/model
exports.local = passport.use(new LocalStrategy(User.authenticate()));

//whenever we use sessions of passport, need to serialize
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());