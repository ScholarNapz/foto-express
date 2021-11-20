"use strict";

var express = require('express');

var router = express.Router();

var genPassword = require('../lib/passwordUtils').genPassword;

var _require = require('express-validator'),
    body = _require.body,
    validationResult = _require.validationResult;

var app = require('../app');

var moment = require('moment');

var passport = require('passport'); // router.use((req, res, next) => {
//     console.log(req.session);
//     console.log(req.user);
//     next();
// });


router.post('/login', [body('username', 'Username is Required').not().isEmpty().trim().escape(), body('password', 'Password is Required').not().isEmpty().trim().escape()], passport.authenticate('local', {
  failureRedirect: '/',
  failureFlash: 'Invalid Username or Password'
}), function (req, res) {
  console.log('login:');
  console.log(req.body.username);
  res.location('/gallery');
  res.redirect('/gallery');
});
/* GET home page. */

router.get('/', function (req, res, next) {
  res.render('landing', {
    title: 'Express'
  });
});
router.get('/register', function (req, res, next) {
  res.render('register');
});
router.get('/login', function (req, res, next) {
  res.render('register');
});
router.post('/register', [body('username', 'Username is Required').not().isEmpty().trim().escape(), body('name', 'Name is Required').not().isEmpty().trim().escape(), body('email', 'Email is Required').not().isEmpty().trim().escape(), body('email', 'Email Formatting Error').isEmail().trim().escape(), body('password', 'Password is Required').not().isEmpty().trim().escape(), body('password2', 'Passwords dont match').custom(function (value, _ref) {
  var req = _ref.req;

  if (value !== req.body.password) {
    throw new Error('Passwords do not match');
  } // Indicates the success of this synchronous custom validator


  return true;
})], function (req, res, next) {
  var username = req.body.username;
  var name = req.body.name;
  var email = req.body.email;
  var saltHash = genPassword(req.body.password);
  var salt = saltHash.salt;
  var hash = saltHash.hash;
  var profileimage = '/profileimages/avatar.png';
  var collections = [];
  var bio = '';
  var date = moment().toISOString();
  var errors = validationResult(req); // console.log(errors);

  if (!errors.isEmpty()) {
    res.render('register', {
      errors: errors.array()
    });
  } else {
    // If there is no error do this
    var db = require('monk')('localhost/fotodb');

    var users = db.get('users');
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
    req.flash('success', 'Registration successful');
    res.location('/');
    res.redirect('/');
  }
}); // passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });
// passport.deserializeUser(function(id, done) {
//     User.getUserById(id, function(err, user) {
//         done(err, user);
//     });
// });
// passport.use(new LocalStrategy((username, password, done) => {
//     User.getUserByUsername(username, (err, user) => {
//         if (err) throw err;
//         if (!user) {
//             return done(null, false, { message: 'Unknown User' });
//         }
//         User.comparePassword(password, user.password, (err, isMatch) => {
//             if (err) return done(err);
//             if (isMatch) {
//                 return done(null, user);
//             } else {
//                 return done(null, false, { message: 'Invalid Password' });
//             }
//         });
//     });
// }));

module.exports = router;