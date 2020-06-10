var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

// connect to MongoDB server!
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

// other way to deal with promise rejection (use two arguments, vs. catch)
connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('12345-67890-09876-54321')); // numbers are a "secret key", could be anything, so we can "sign" the cookie

//authentication middleware before users have access to static files
function auth(req, res, next) {
  if (!req.signedCookies.user) { //signedCookies property is provided by cookieParser
    console.log(req.headers);
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
    const user = auth[0];
    const pass = auth[1];
    if (user === 'admin' && pass === 'password') {
      res.cookie('user', 'admin', {signed: true}); // set up a cookie
      return next(); // authorized! access has now been granted
    } else {
        const err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');      
        err.status = 401;
        return next(err);
    }
  } else { // if there is a signedCookie
    if (req.signedCookies.user === 'admin') { // if the user = 'admin'
      return next(); // continue
    } else {
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    }
  }
}

// actually use the auth middleware we set up above
app.use(auth);

//express.static middleware that serves static files to client
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
