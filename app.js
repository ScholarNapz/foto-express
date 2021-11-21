const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const session = require('express-session');

//? include passport
const passport = require('passport');

const bcrypt = require('bcryptjs');
const multer = require('multer');
const flash = require('connect-flash');
//? MONK
var db = require('monk')('localhost/fotodb');


//? Moment
const moment = require('moment');

const sharp = require('sharp');


const landingRouter = require('./routes/landing');
const usersRouter = require('./routes/users');
const imagesRouter = require('./routes/images');
const galleryRouter = require('./routes/gallery');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));
app.use('/uploads/', express.static(path.join(__dirname, 'static/uploads')));
app.use('/thumbnails/', express.static(path.join(__dirname, 'static/thumbnails')));

require('dotenv').config();

//? missing middleware
//multer
const upload = multer({ dest: 'static/uploads' });


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

// //!------------------
// app.get('*', (req, res, next) => {
//     res.locals.user = req.user || null;
//     next();
// });

//handle sessions
const MongoStore = require('connect-mongo');

const sessionStore = MongoStore.create({
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
app.use(passport.session());

// app.use((req, res, next) => {
//     console.log(req.session);
//     console.log(req.user);
//     next();
// });

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
})


app.use('/', landingRouter);
app.use('/users', usersRouter);
app.use('/images', imagesRouter);
app.use('/gallery', galleryRouter);


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