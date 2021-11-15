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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));
app.use('/uploads/', express.static(path.join(__dirname,'static/uploads')));
app.use('/thumbnails/', express.static(path.join(__dirname,'static/thumbnails')));


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


/*
! UPLOAD IMAGES
*/




// let imageName = null

// //! file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, '/static/uploads/');
//     },
//     filename: (req, file, cb) => {
//         imageName = moment(new Date()).format('YMDHHmmssSSSS') + '.' + file.originalname.split('.').pop();
//         console.log(imageName);
//         cb(null, imageName);
//     }
// });

// //! validate file type by mime
// const fileFilter = (req, file, cb) => {
//     //? reject file cb(null, false)
//     //? accept file cb(null, true)
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/bmp' || file.mimetype === 'image/gif') {
//         cb(null, true);
//     } else {
//         cb(new Error('File is not in image format.'), false);
//     }
// };


// const upload = multer({
//     storage: storage,

//     limits: { //? set file upload limit
//         fileSize: 1024 * 1024 * 5 //! Max upload of 5mb
//     },

//     fileFilter: fileFilter
// });


// app.post('/upload', upload.single('upload-image'), (req, res, next) => {
//     console.log("0000");
//     console.log(imageName);
//     sharp('static/uploads/' + imageName).resize(300, 300).toFile('static/thumbnails/' + imageName, (err, info) => {
//         console.log(__dirname);
//     });


//     res.location('/gallery')
//     res.redirect('/gallery');

// });


module.exports = app;