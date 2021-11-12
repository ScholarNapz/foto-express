const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//? missing 
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');

const session = require('express-session');

//? include passport
const passport = require('passport');
const LocalStratery = require('passport-local').Strategy;
//? include bcrypt
const bcrypt = require('bcryptjs');

const multer = require('multer');

const flash = require('connect-flash');
//? DB
const mongo = require('mongodb');
const mongoose = require('mongoose');
//? MONK
var db = require('monk')('localhost/fotodb');

//?MONGOOSE
//let db = mongoose.connection;

//? Moment
const moment = require('moment');


const landingRouter = require('./routes/landing');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));

//? missing middleware
//multer
const upload = multer({ dest: 'static/uploads' });
//handle sessions
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));
//passport
app.use(passport.initialize());
app.use(passport.session());
//messages middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//? MONK
app.use((req, res, next) => {
    req.db = db;
    next();
});

//!------------------
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use('/', landingRouter);
app.use('/users', usersRouter);

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