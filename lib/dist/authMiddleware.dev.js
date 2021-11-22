"use strict";

var alert = require('alert');

module.exports.isAuth = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    alert('Please Login Or Register To Use The App');
    res.redirect('/');
  }
};

module.exports.isAccountOwner = function (req, res, next) {
  console.log(req.user.username, req.params.username);

  if (req.isAuthenticated() && req.user.username === req.params.username) {
    next();
  } else {
    res.redirect('/');
  }
};

module.exports.isOwner = function (req, res, next) {
  console.log(req.user.username, req.params.username);

  if (req.isAuthenticated() && req.user.username === req.params.username) {
    next();
  } else {
    res.redirect('/');
  }
};