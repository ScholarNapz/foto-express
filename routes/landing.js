const express = require('express');
const router = express.Router();
const genPassword = require('../lib/passwordUtils').genPassword;
const { body, validationResult } = require('express-validator');
const app = require('../app');
const moment = require('moment');
const passport = require('passport');

const alert = require('alert');

// router.use((req, res, next) => {
//     console.log(req.session);
//     console.log(req.user);
//     next();
// });

function isAvailable(req, res, next) {
    req.db.get('users').findOne({ username: req.body.username }).then((user) => {
        try {
            if (user['username'] === req.body.username) {
                alert('Username already In Use');
                res.location('/register')
                res.redirect('/register')
            } else {
                next();
            }
        } catch (error) {
            next();
        }


    });
};

router.post('/login', [
        body('username', 'Username is Required').not().isEmpty().trim().escape(),
        body('password', 'Password is Required').not().isEmpty().trim().escape(),
    ], passport.authenticate('local', { failureRedirect: '/', failureFlash: 'Invalid Username or Password' }),
    function(req, res) {

        console.log('login:');
        console.log(req.body.username);

        res.location('/gallery');
        res.redirect('/gallery');
    });

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

router.post('/register', isAvailable, [
        body('username', 'Username is Required').not().isEmpty().trim().escape(),
        body('name', 'Name is Required').not().isEmpty().trim().escape(),
        body('email', 'Email is Required').not().isEmpty().trim().escape(),
        body('email', 'Email Formatting Error').isEmail().trim().escape(),
        body('password', 'Password is Required').not().isEmpty().trim().escape(),
        body('password2', 'Passwords dont match').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }

            // Indicates the success of this synchronous custom validator
            return true;
        }),
    ],
    (req, res, next) => {
        const username = req.body.username;
        const name = req.body.name;
        const email = req.body.email;
        const saltHash = genPassword(req.body.password);
        const salt = saltHash.salt;
        const hash = saltHash.hash;
        const profileimage = '/profileimages/avatar.png';
        const collections = [];
        const bio = '';
        const date = moment().toISOString();


        const errors = validationResult(req);
        // console.log(errors);


        if (!errors.isEmpty()) {
            res.render('register', {
                errors: errors.array()
            });
        } else {
            // If there is no error do this

            const db = require('monk')('localhost/fotodb');
            const users = db.get('users');
            users.insert({
                username: username,
                name: name,
                email: email,
                salt: salt,
                hash: hash,
                bio: bio,
                collections: collections,
                profileimage: profileimage,
                date: date
            });

            alert('Registration successful');

            res.location('/');
            res.redirect('/');
        }
    });

module.exports = router;