const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
    User.findOne({username: req.body.username})
    .then(user => {
        if (user) {
            const err = new Error(`User ${req.body.username} already exists!`);
            err.status = 403;
            return next(err);
        } else {
            User.create({
                username: req.body.username,
                password: req.body.password})
            .then(user => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: 'Registration Successful!', user: user});
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
});

router.post('/login', (req, res, next) => {
    if(!req.session.user) { // user is NOT logged in

        const authHeader = req.headers.authorization; //store authorization header
        if (!authHeader) { //if null, then user hasn't put in a username/password yet
            const err = new Error('You are not authenticated!'); //error message
            res.setHeader('WWW-Authenticate', 'Basic'); //set header; server is requesting authentication with 'Basic' method
            err.status = 401; //standard status code
            return next(err); //authomatically send error message back & challenge client for credentials
            //once user types in credentials, auth function repeats, and now there IS an authorization header, so this part is skipped
        }
      
        // there is an authorization header
        // decodes & parses authorization header into array, with username & password
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const username = auth[0];
        const password = auth[1];
      
        User.findOne({username: username})
        .then(user => {
            if (!user) {
                const err = new Error(`User ${username} does not exist!`);
                err.status = 403;
                return next(err);
            } else if (user.password !== password) {
                const err = new Error('Your password is incorrect!');
                err.status = 403;
                return next(err);
            } else if (user.username === username && user.password === password) {
                req.session.user = 'authenticated'; // starts tracking a session for the user who has just logged in
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You are authenticated!')
            }
        })
        .catch(err => next(err));
    } else { // there is a session being tracked for this client; the user is already logged in
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated!');
    }
});

router.get('/logout', (req, res, next) => {
    if (req.session) {
      req.session.destroy(); // deleting the session file on the server side
      res.clearCookie('session-id');
      res.redirect('/'); //redirets user to the root path: localhost:3000
    } else {
      const err = new Error('You are not logged in!');
      err.status = 403;
      return next(err);
    }
});

module.exports = router;