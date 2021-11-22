"use strict";

var express = require('express');

var router = express.Router();

var passport = require('passport');

var isAuth = require('../lib/authMiddleware').isAuth;

var alert = require('alert');

var fs = require('fs');

function isOwner(req, res, next) {
  console.log("username: ".concat(req.user.username));
  console.log("usr:      ".concat(req.params.usr));

  if (req.user.username === req.params.usr) {
    next();
  } else {
    alert("This Operation Is Reserved For The Owner Only");
    res.render('/gallery', {
      title: 'Gallery',
      username: req.user.username,
      image: image
    });
  }
}
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
      isCollection: false,
      username: req.user.username,
      images: images
    });
  });
});
router.post('/tags', isAuth, function (req, res, next) {
  res.location('./tags/' + req.body.search);
  res.redirect('./tags/' + req.body.search);
});
router.get('/tags/:id', isAuth, function (req, res, next) {
  var images = req.db.get('images');
  images.find({
    tags: {
      $regex: ".*" + req.params.id + ".*"
    }
  }, {
    sort: {
      date: -1
    }
  }).then(function (imgs) {
    console.log(imgs);
    res.render('gallery', {
      title: 'Tags Search: ' + req.params.id,
      username: req.user.username,
      isCollection: false,
      images: imgs
    });
  });
});
router.get('/collection/:usr/:id', isAuth, function (req, res, next) {
  var images = req.db.get('images');
  var id = req.params.id;
  console.log("Collection name:\n".concat(id));
  images.find({
    username: req.params.usr,
    collections: req.params.id
  }, {
    sort: {
      date: -1
    }
  }).then(function (imgs) {
    console.log(imgs);
    res.render('gallery', {
      title: req.params.id,
      isCollection: true,
      username: req.user.username,
      usr: req.params.usr,
      images: imgs
    });
  });
});
router.get('/remove/collection/:usr/:id/', isAuth, isOwner, function (req, res) {
  console.log("===================\n".concat(req.params.usr, "\n-----------------\nDELETE COLLETION\n").concat(req.params.id, "==================="));
  var images = req.db.get('images');
  images.find({
    username: req.user.username,
    collections: {
      $in: [req.params.id]
    }
  }).then(function (image) {
    console.log("user: ".concat(req.user.username));
    console.log("coll: ".concat(req.params.id));
    console.log(image);
    var adminObj = {};
    var jsn = JSON.parse(JSON.stringify(image));
    var arr = [];
    arr = jsn;

    if (arr.length == 0) {
      console.log("===================\n".concat(req.params.usr, "\n-----------------\nEMPTY COLLECTION\n").concat(req.params.id, "==================="));
    } else {
      var itemsDone = 0;
      arr.forEach(function (elm) {
        elm.location;

        var dirName = (__dirname + '').split('/');

        dirName.pop();
        var staticPath = '';
        dirName.forEach(function (folder) {
          staticPath += folder + '/';
        });
        staticPath += 'static';
        console.log(elm.location);
        console.log(elm.thumbnail);
        console.log(staticPath); // image['thumbnail']
        // image['location']

        try {
          fs.unlinkSync(staticPath + elm.thumbnail);
          fs.unlinkSync(staticPath + elm.location);
        } catch (error) {
          console.log("===================\nDelete error: ".concat(error, "\n==================="));
        }

        images.remove({
          location: elm.location
        });
        itemsDone++;

        if (itemsDone === arr.length) {
          alert('Image Is Removed');
          res.location('/users/myprofile');
          res.redirect('/users/myprofile');
        }
      });
    } // if (image['username'] + req.user.username) {
    //     images.remove({ name: req.params.id }).then(() => {
    //     })
    // }

  });
});
module.exports = router;