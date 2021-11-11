"use strict";

var express = require('express');

var router = express.Router();

var _require = require('express-validator'),
    body = _require.body,
    validationResult = _require.validationResult;

var app = require('../app'); // const User = require('../models/user');


var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy; //? DB


var mongodb = require('mongodb');

var db = require('monk')('localhost/fotodb');
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
router.post('/register', [body('username', 'Username is Required').not().isEmpty(), body('name', 'Name is Required').not().isEmpty(), body('email', 'Email is Required').not().isEmpty(), body('email', 'Email Formatting Error').isEmail(), body('password', 'Password is Required').not().isEmpty(), body('password2', 'Passwords dont match').custom(function (value, _ref) {
  var req = _ref.req;

  if (value !== req.body.password) {
    throw new Error('Passwords do not match');
  } // Indicates the success of this synchronous custom validator


  return true;
})], function (req, res, next) {
  var username = req.body.username;
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  var profileimage = '/profileimages/avatar.png';
  var errors = validationResult(req);
  console.log(errors);

  if (!errors.isEmpty()) {
    res.render('register', {
      errors: errors.array()
    });
  } else {
    // If there is no error do this
    console.log('No Errors...');
    var newUser = new User({
      username: username,
      name: name,
      email: email,
      password: password,
      profileimage: profileimage
    });
    User.createUser(newUser, function (err, user) {
      if (err) throw err;
      console.log(user);
    });
    req.flash('success', 'Registration successful');
    res.location('/');
    res.redirect('/');
  }
});
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});
passport.use(new LocalStrategy(function (username, password, done) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;

    if (!user) {
      return done(null, false, {
        message: 'Unknown User'
      });
    }

    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) return done(err);

      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: 'Invalid Password'
        });
      }
    });
  });
}));
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/',
  failureFlash: 'Invalid Username or Password'
}), function (req, res) {
  req.flash('success', 'Login Successful'); //!---------------- res.redirect('/users/' + req.user.username);

  res.redirect('/users/');
});
module.exports = router;