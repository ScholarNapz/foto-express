var express = require('express');
var router = express.Router();

const { body, validationResult } = require('express-validator');
const app = require('../app');
const User = require('../models/user');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//? DB
const mongodb = require('mongodb');
const db = require('monk')('localhost/fotodb');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('landing', { title: 'Express' });
});

router.get('/register', function(req, res, next) {
    res.render('register');
});

router.get('/login', function(req, res, next) {
    res.render('register');
});

router.post('/register', [
        body('username', 'Username is Required').not().isEmpty(),
        body('name', 'Name is Required').not().isEmpty(),
        body('email', 'Email is Required').not().isEmpty(),
        body('email', 'Email Formatting Error').isEmail(),
        body('password', 'Password is Required').not().isEmpty(),
        body('password2', 'Passwords dont match').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }

            // Indicates the success of this synchronous custom validator
            return true;
        }),
    ],
    (req, res, next) => {
        let username = req.body.username;
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password;
        let password2 = req.body.password2;
        let profileimage = '/profileimages/avatar.png'


        const errors = validationResult(req);
        // console.log(errors);


        if (!errors.isEmpty()) {
            res.render('register', {
                errors: errors.array()
            });
        } else {
            // If there is no error do this
            // console.log('No Errors...');
            var newUser = new User({
                username: username,
                name: name,
                email: email,
                password: password,
                profileimage: profileimage
            });

            User.createUser(newUser, (err, user) => {
                if (err) throw err;
                // console.log(user);
            });

            req.flash('success', 'Registration successful');

            res.location('/');
            res.redirect('/');
        }
    });

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy((username, password, done) => {
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return done(null, false, { message: 'Unknown User' });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) return done(err);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid Password' });
            }
        });
    });
}));

router.post('/login', passport.authenticate('local', { failureRedirect: '/', failureFlash: 'Invalid Username or Password' }),
    function(req, res) {

        req.flash('success', 'Login Successful');
        //!---------------- res.redirect('/users/' + req.user.username);
        res.redirect('/gallery');
    });

module.exports = router;