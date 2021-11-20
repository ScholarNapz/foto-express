"use strict";

var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;

var connection = require('./user');

var User = connection.models.users;

var validatePassword = require('../lib/passwordUtils').validatePassword;

require('dotenv').config(); // const db = require('monk')(process.env.DB_STRING);
// const user = db.get('users');
//? if you dont use username and password for login form name - you can set custom names 


var customField = {
  usernameField: 'username',
  passwordField: 'password'
};

var verifyCallback = function verifyCallback(username, password, done) {
  // const db = require('monk')(process.env.DB_STRING);
  // const user = db.get('users');
  // console.log(user);
  // console.log(username);
  User.findOne({
    username: username
  }).then(function (user) {
    // console.log('...');
    // console.log(user);
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
  }); // const db = require('monk')(process.env.DB_STRING);
  // const user = db.get('users');
  // user.findOne({ username: username })
  //     .then((user) => {
  //         if (!user) { return done(null, false) }
  //         const isValid = validatePassword(password, user.hash, user.salt);
  //         if (isValid) {
  //             return done(null, user);
  //         } else {
  //             return done(null, false);
  //         }
  //     })
  //     .catch((err) => {
  //         done(err);
  //     });
}; // const strategy = new LocalStrategy(customField, verifyCallback);


var strategy = new LocalStrategy(verifyCallback);
passport.use(strategy);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (userId, done) {
  console.log(User);
  User.findById(userId).then(function (user) {
    done(null, user);
  })["catch"](function (err) {
    return done(err);
  }); // const db = require('monk')(process.env.DB_STRING);
  // const user = db.get('users');
  // console.log('....123456789.........');
  // console.log(userId);
  // user.findOne({ _id: userID }).then((user) => {
  //         done(null, user);
  //     })
  //     .catch(err => done(err))
});