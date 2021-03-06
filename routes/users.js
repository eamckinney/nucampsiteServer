const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const router = express.Router();

/* GET users listing. */
router.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
    User.find()
    .then(users => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users); 
    })
});

router.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.post('/signup', cors.corsWithOptions, (req, res) => {
    User.register( //this method takes care of most things!
        new User({username: req.body.username}),
        req.body.password, (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            } else {
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                user.save(err => { //saves user's first & last names to database
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err: err});
                        return;
                    }
                    passport.authenticate('local')(req, res, () => { // authenticates new registered user
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({success: true, status: 'Registration Successful!'});
                    });
                });
            }
        }
    );
});

//passport.authenticate handles everything for us
router.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({_id: req.user._id}); //issues a token
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get('/logout', cors.corsWithOptions, (req, res, next) => {
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

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
    if (req.user) { // makes sure there is a valid user (there should be, the facebook strategy should have created one)
        const token = authenticate.getToken({_id: req.user._id}); // new json web token
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, token: token, status: 'You are successfully logged in!'});
    }
});

module.exports = router;