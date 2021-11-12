"use strict";

var createError = require('http-errors');

var express = require('express');

var path = require('path');

var cookieParser = require('cookie-parser');

var logger = require('morgan'); //? missing 


var favicon = require('serve-favicon');

var bodyParser = require('body-parser');

var session = require('express-session'); //? include passport


var passport = require('passport');

var LocalStratery = require('passport-local').Strategy; //? include bcrypt


var bcrypt = require('bcryptjs');

var multer = require('multer');

var flash = require('connect-flash'); //? DB


var mongo = require('mongodb');

var mongoose = require('mongoose'); //? MONK


var db = require('monk')('localhost/fotodb'); //?MONGOOSE
//let db = mongoose.connection;
//? Moment


var moment = require('moment');

var landingRouter = require('./routes/landing');

var usersRouter = require('./routes/users');

var app = express(); // view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express["static"](path.join(__dirname, 'static'))); //? missing middleware
//multer

var upload = multer({
  dest: 'static/uploads'
}); //handle sessions

app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
})); //passport

app.use(passport.initialize());
app.use(passport.session()); //messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
}); //? MONK

app.use(function (req, res, next) {
  req.db = db;
  next();
}); //!------------------

app.get('*', function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});
app.use('/', landingRouter);
app.use('/users', usersRouter); // catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
}); // error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // render the error page

  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;