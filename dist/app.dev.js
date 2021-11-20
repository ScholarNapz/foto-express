"use strict";

var createError = require('http-errors');

var express = require('express');

var path = require('path');

var cookieParser = require('cookie-parser');

var logger = require('morgan');

var session = require('express-session'); //? include passport


var passport = require('passport');

var bcrypt = require('bcryptjs');

var multer = require('multer');

var flash = require('connect-flash'); //? MONK


var db = require('monk')('localhost/fotodb'); //? Moment


var moment = require('moment');

var sharp = require('sharp');

var landingRouter = require('./routes/landing');

var usersRouter = require('./routes/users');

var imagesRouter = require('./routes/images');

var galleryRouter = require('./routes/gallery');

var app = express(); // view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express["static"](path.join(__dirname, 'static')));
app.use('/uploads/', express["static"](path.join(__dirname, 'static/uploads')));
app.use('/thumbnails/', express["static"](path.join(__dirname, 'static/thumbnails')));

require('dotenv').config(); //? missing middleware
//multer


var upload = multer({
  dest: 'static/uploads'
}); //messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
}); //? MONK

app.use(function (req, res, next) {
  req.db = db;
  next();
}); // //!------------------
// app.get('*', (req, res, next) => {
//     res.locals.user = req.user || null;
//     next();
// });
//handle sessions

var MongoStore = require('connect-mongo');

var sessionStore = MongoStore.create({
  mongoUrl: process.env.DB_STRING,
  collectionName: 'sessions',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
});
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 //? 1 Day

  }
}));
/*-----------------------
 PASSPORT
 -------------------------------*/

require('./config/passport');

app.use(passport.initialize());
app.use(passport.session()); // app.use((req, res, next) => {
//     console.log(req.session);
//     console.log(req.user);
//     next();
// });

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
app.use('/', landingRouter);
app.use('/users', usersRouter);
app.use('/images', imagesRouter);
app.use('/gallery', galleryRouter); // catch 404 and forward to error handler

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