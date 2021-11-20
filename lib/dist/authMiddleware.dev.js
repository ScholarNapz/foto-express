"use strict";

module.exports.isAuth = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};

module.exports.isAdmin = function (req, res, next) {
  if (req.isAuthenticated() && req.user.admin) {
    next();
  } else {// res.redirect('/');
  }
};