"use strict";

var express = require('express');

var router = express.Router();
/* GET home page. */

router.get('/', function (req, res, next) {
  var db = req.db;
  var images = db.get('images');
  images.find({}, {
    sort: {
      date: -1
    }
  }).then(function (images) {
    res.render('gallery', {
      title: 'Express',
      images: images
    });
  });
});
module.exports = router;