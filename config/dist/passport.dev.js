"use strict";

var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;

var connection = require('./user');

var User = connection.models.users;

var validatePassword = require('../lib/passwordUtils').validatePassword;

require('dotenv').config(); //? if you dont use username and password for login form name - you can set custom names 


var customField = {
  usernameField: 'username',
  passwordField: 'password'
};

var verifyCallback = function verifyCallback(username, password, done) {
  User.findOne({
    username: username
  }).then(function (user) {
    if (!user) {
      return done(null, false);
    }

    var isValid = validatePassword(password, user.hash, user.salt);

    if (isValid) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  })["catch"](function (err) {
    done(err);
  });
};

var strategy = new LocalStrategy(verifyCallback);
passport.use(strategy);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (userId, done) {
  User.findById(userId).then(function (user) {
    done(null, user);
  })["catch"](function (err) {
    return done(err);
  });
});