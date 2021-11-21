"use strict";

var express = require('express');

var router = express.Router();

var passport = require('passport');

var isAuth = require('../lib/authMiddleware').isAuth;

var fs = require('fs');

var sharp = require('sharp');

var _require = require("child_process"),
    exec = _require.exec; //? DB


var db = require('monk')('localhost/fotodb'); // const users = db.get('users');


var imageName = null; //! file uploads

var multer = require('multer');

var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'static/.temp/');
  },
  filename: function filename(req, file, cb) {
    imageName = req.user.username + '.' + file.originalname.split('.').pop();
    cb(null, imageName);
  }
}); //! validate file type by mime

var fileFilter = function fileFilter(req, file, cb) {
  //? reject file cb(null, false)
  //? accept file cb(null, true)
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/pjpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/bmp') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var upload = multer({
  storage: storage,
  limits: {
    //? set file upload limit
    fileSize: 1024 * 1024 * 15 //! Max upload of 15mb

  },
  fileFilter: fileFilter
});
router.post('/upload', isAuth, upload.single('upload-image'), function (req, res, next) {
  if (imageName != null) {
    var users = db.get('users');

    var dirName = (__dirname + '').split('/');

    dirName.pop();
    var staticPath = '';
    dirName.forEach(function (folder) {
      staticPath += folder + '/';
    });
    console.log(imageName); //! Convert imageName upload/<Imagefile> to 300x300 and save in thumbnails/<ImageName>
    // if (imageName.split('.').pop() !== '.gif') {
    //     fs.copyFile(staticPath + 'static/.temp/' + imageName,
    //         staticPath + 'static/profileimages/' + imageName, (err) => {
    //             if (err) throw err;
    //         });
    // } else {

    sharp(staticPath + 'static/.temp/' + imageName).resize(300, 300).toFile(staticPath + 'static/profileimages/' + imageName, function (err, info) {
      console.log('converted');
    }); // }

    users.update({
      username: req.user.username
    }, {
      $set: {
        profileimage: '/profileimages/' + imageName
      }
    }).then(function () {
      console.log('profile image update');
      res.location('/users/myprofile/');
      res.redirect('/users/myprofile/');
    });
  } else {
    res.location('/users/myprofile/');
    res.redirect('/users/myprofile/');
  }
});
/*
let tempFilePath = staticPath + 'static/.temp/' + imageName;
let saveFilePath = staticPath + 'static/profileimages/' + imageName;
let staticFilePath = '/profileimages/' + imageName;

let execLine = "python3 " + "'" + staticPath + "thumbnails.py' '" + tempFilePath + "' '" + saveFilePath + "' 300"

exec(execLine, (error, stdout, stderr) => {
    if (error) {
        res.location('/users/myprofile/');
        res.redirect('/users/myprofile/');
        return;
    }

    let pathToTempPic = staticPath + 'static/.temp/' + imageName;
    // let pathToTempPic = staticPath + 'profileimages' + user['profileimage'];
    try {
        fs.unlinkSync(pathToTempPic)
    } catch (error) {
        console.log(`Delete error: ${error}`);
    }
    
    


users.update({ username: req.user.username }, { $set: { profileimage: staticFilePath } }).then();
}

res.location('/users/myprofile/');
res.redirect('/users/myprofile/');
});

router.post('/edit/bio/:id/', isAuth, (req, res) => {
    const user = db.get('users');
    user.update({ username: req.user.username }, { $set: { bio: req.body.bio } })
    res.location('/users/profile/' + req.params.id);
    res.redirect('/users/profile/' + req.params.id);
});

router.get('/', isAuth, (req, res) => {
    const users = db.get('users');
    users.find({ $nor: [{ $and: [{ 'username': req.user.username }] }] }).then(usr => {
        res.render('users', { title: 'Users', username: req.user.username, users: usr });
    });
});
*/

/* GET users listing. */

router.get('/profile/:id/', isAuth, function (req, res) {
  var users = db.get('users');
  var images = db.get('images');

  if (req.user.username === req.params.id) {
    res.location('/users/myprofile');
    res.redirect('/users/myprofile');
  } else {
    var _users = db.get('users');

    var _images = db.get('images');

    _users.findOne({
      username: req.params.id
    }).then(function (user) {
      getCollectionImages(unique(user.collections), user.username, _images, _users).then(function (collection) {
        _images.find({
          username: user.username
        }).then(function (imgs) {
          res.render('user', {
            title: user.username,
            username: req.user.username,
            images: imgs,
            user: user,
            colls: collection
          });
        });
      });
    });
  }
});
router.get('/myprofile', isAuth, function (req, res) {
  var users = db.get('users');
  var images = db.get('images');
  users.findOne({
    username: req.user.username
  }).then(function (user) {
    getCollectionImages(unique(user.collections), user.username, images, users).then(function (collection) {
      images.find({
        username: user.username
      }).then(function (imgs) {
        res.render('myprofile', {
          title: user.username,
          username: req.user.username,
          images: imgs,
          user: user,
          colls: collection
        });
      });
    });
  });
});
/*-------------------------------
* FIND COLLECTIONS TO POPULATE COLLECTIONS OF USER
-------------------------------------*/

function unique(collections) {
  return collections.sort().filter(function (item, pos, ary) {
    return !pos || item != ary[pos - 1];
  });
}

var getCollectionImages = function getCollectionImages(collections, username, images, users) {
  var collectionObj = {};
  return new Promise(function (resolve, reject) {
    if (collections.length == 0) {
      resolve(collectionObj);
    } else {
      var itemsDone = 0;
      collections.forEach(function (element) {
        images.findOne({
          username: username,
          collections: {
            $in: [element]
          }
        }).then(function (image) {
          try {
            collectionObj[element] = image['thumbnail'];
          } catch (error) {
            users.update({
              username: username
            }, {
              $pull: {
                'collections': element
              }
            });
          }

          itemsDone++;

          if (itemsDone === collections.length) {
            resolve(collectionObj);
          }
        });
      });
    }
  });
};

router.post('/profile/search', isAuth, function (req, res) {
  res.location('/users/profile/search/' + req.body.search);
  res.redirect('/users/profile/search/' + req.body.search);
});
router.get('/profile/search/:id', isAuth, function (req, res) {
  var users = req.db.get('users');
  users.find({
    username: {
      $regex: ".*" + req.params.id + ".*"
    }
  }, {
    sort: {
      date: -1
    }
  }).then(function (usr) {
    res.render('users', {
      title: 'Usernames containing "' + req.params.id + '"',
      users: usr
    });
  });
});
router.get('/logout', isAuth, function (req, res) {
  req.logOut();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
});
module.exports = router;