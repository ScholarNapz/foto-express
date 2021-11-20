"use strict";

var express = require('express');

var router = express.Router();

var passport = require('passport');

var isAuth = require('../lib/authMiddleware').isAuth;
/* GET home page. */


router.get('/', isAuth, function (req, res, next) {
  var images = req.db.get('images');
  console.log('123456123');
  console.log(req.user.username);
  images.find({}, {
    sort: {
      date: -1
    }
  }).then(function (images) {
    res.render('gallery', {
      title: 'Gallery',
      images: images
    });
  });
});
router.post('/tags', isAuth, function (req, res, next) {});
module.exports = router;