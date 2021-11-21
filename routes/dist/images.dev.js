"use strict";

var express = require('express');

var router = express.Router();

var fs = require('fs');

var _require = require('express-validator'),
    body = _require.body,
    validationResult = _require.validationResult; //! to format date string


var moment = require('moment'); //! to get full path of of file- to rip extension


var path = require('path');

var sharp = require('sharp');

var isAuth = require('../lib/authMiddleware').isAuth; // const isOwner = require('../lib/authMiddleware').isOwner;


function isOwner(req, res, next) {
  console.log(req.params.id);
  req.db.get('images').findOne({
    name: req.params.id
  }).then(function (image) {
    if (image['username'] === req.user.username) {
      next();
    } else {
      res.location('/images/view/' + req.params.id + '/#');
      res.redirect('/images/view/' + req.params.id + '/#');
    }
  });
}

;
var imageName = null; //! file uploads

var multer = require('multer');

var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'static/uploads/');
  },
  filename: function filename(req, file, cb) {
    imageName = moment(new Date()).format('YMDHHmmssSSSS') + '.' + file.originalname.split('.').pop();
    cb(null, imageName);
  }
}); //! validate file type by mime

var fileFilter = function fileFilter(req, file, cb) {
  //? reject file cb(null, false)
  //? accept file cb(null, true)
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/pjpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/bmp' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('File is not in image format.'), false);
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
/* GET home page. */

router.get('/upload', isAuth, function (req, res, next) {
  res.render('upload', {
    title: 'Uplaod',
    username: req.user.username
  });
});
router.get('/view/:id/', function (req, res, next) {
  console.log(req.user.username);
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    if (image.username === req.user.username) {
      res.render('editImage', {
        title: 'Express',
        username: req.user.username,
        image: image
      });
    } else {
      res.render('viewImage', {
        title: 'image.name',
        username: req.user.username,
        image: image
      });
    }
  });
});
router.get('/edit/:id/removetag/:tag', isOwner, function (req, res, next) {
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    if (image.username === req.user.username) {
      images.update({
        name: req.params.id
      }, {
        $pull: {
          'tags': req.params.tag
        }
      });
    }

    res.location('/images/view/' + req.params.id + '/#addtag');
    res.redirect('/images/view/' + req.params.id + '/#addtag');
  });
});
router.get('/edit/:id/removecollection/:collection', isOwner, function (req, res, next) {
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    if (image.username === req.user.username) {
      images.update({
        name: req.params.id
      }, {
        $pull: {
          'collections': req.params.collection
        }
      });
    }

    res.location('/images/view/' + req.params.id + '/#addcollection');
    res.redirect('/images/view/' + req.params.id + '/#addcollection');
  });
});
router.post('/edit/:id/addtag/', isOwner, [body('addtag', 'empty').trim().escape(), body('addtag', 'empty').not().isEmpty()], function (req, res, next) {
  // 
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    if (image.username === req.user.username) {
      if (validationResult(req).isEmpty() && req.body.addtag.trim() !== '' && req.body.addtag.trim() !== '.' && req.body.addtag.trim() !== '?') {
        images.find({
          name: req.params.id,
          tags: {
            $in: [req.body.addtag]
          }
        }).then(function (tag) {
          if (tag.length === 0) {
            images.update({
              name: req.params.id
            }, {
              $push: {
                tags: req.body.addtag
              }
            }).then(function (image) {
              res.location('/images/view/' + req.params.id + '/#addtag');
              res.redirect('/images/view/' + req.params.id + '/#addtag');
            });
          } else {
            res.location('/images/view/' + req.params.id + '/#addtag');
            res.redirect('/images/view/' + req.params.id + '/#addtag');
          }
        });
      } else {
        res.location('/images/view/' + req.params.id + '/#addtag');
        res.redirect('/images/view/' + req.params.id + '/#addtag');
      }

      ;
    } else {
      res.location('/images/view/' + req.params.id + '/#addtag');
      res.redirect('/images/view/' + req.params.id + '/#addtag');
    }
  });
});
router.post('/edit/:id/addcollection/', isOwner, [body('addcollection', 'empty').trim().escape(), body('addcollection', 'empty').not().isEmpty()], function (req, res, next) {
  var images = req.db.get('images');
  var user = req.db.get('users');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    console.log('_-_-_-_-__');
    console.log(image);
    console.log(image.username + ' ' + req.user.username);

    if (image.username === req.user.username) {
      if (validationResult(req).isEmpty() && req.body.addcollection.trim() !== '' && req.body.addcollection.trim() !== '.' && req.body.addcollection.trim() !== '?') {
        images.find({
          name: req.params.id,
          collections: {
            $in: [req.body.addcollection]
          }
        }).then(function (col) {
          console.log('NOOO');
          console.log(col);
          console.log('N111'); // console.log(col.collections);

          console.log('qwe');

          if (col.length === 0) {
            // if (col.include(req.body.addcollection)) {
            user.update({
              username: req.user.username
            }, {
              $push: {
                collections: req.body.addcollection
              }
            }).then(function () {
              images.update({
                name: req.params.id
              }, {
                $push: {
                  collections: req.body.addcollection
                }
              }).then(function (image) {
                res.location('/images/view/' + req.params.id + '/#addcollection');
                res.redirect('/images/view/' + req.params.id + '/#addcollection');
              });
            });
          } else {
            res.location('/images/view/' + req.params.id + '/#addcollection');
            res.redirect('/images/view/' + req.params.id + '/#addcollection');
          }
        });
      } else {
        res.location('/images/view/' + req.params.id + '/#addcollection');
        res.redirect('/images/view/' + req.params.id + '/#addcollection');
      }

      ;
    } else {
      res.location('/images/view/' + req.params.id + '/#addcollection');
      res.redirect('/images/view/' + req.params.id + '/#addcollection');
    }
  });
});
router.post('/edit/:id/description/', isOwner, [body('description', 'empty').trim().escape(), body('description', 'empty').not().isEmpty()], function (req, res, next) {
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    if (image.username === req.user.username) {
      console.log('123456');
      console.log(req.body.description);
      images.update({
        name: req.params.id
      }, {
        $set: {
          description: req.body.description
        }
      }).then(function (image) {
        res.location('/images/view/' + req.params.id + '/#description');
        res.redirect('/images/view/' + req.params.id + '/#description');
      });
    } else {
      res.location('/images/view/' + req.params.id + '/#description');
      res.redirect('/images/view/' + req.params.id + '/#description');
    }
  });
});
router.post('/upload', isAuth, upload.single('upload-image'), function (req, res, next) {
  var dirName = (__dirname + '').split('/');

  dirName.pop();
  var staticPath = '';
  dirName.forEach(function (folder) {
    staticPath += folder + '/';
  }); //! Convert imageName upload/<Imagefile> to 300x300 and save in thumbnails/<ImageName>

  if (imageName.split('.').pop() !== '.gif') {
    fs.copyFile(staticPath + 'static/uploads/' + imageName, staticPath + 'static/thumbnails/' + imageName, function (err) {
      if (err) throw err;
    });
  } else {
    sharp(staticPath + 'static/uploads/' + imageName).resize(300, 300).toFile(staticPath + 'static/thumbnails/' + imageName, function (err, info) {});
  } //


  var images = req.db.get('images');
  var name = imageName.split('.');
  name.pop();
  var imageLoc = '/uploads/' + imageName;
  var thumbnailLoc = '/thumbnails/' + imageName;
  var username = req.user.username;
  var description = '';
  var collections = [];
  var tags = [];
  var date = moment().toISOString();
  images.insert({
    name: name[0],
    location: imageLoc,
    thumbnail: thumbnailLoc,
    username: username,
    description: description,
    collections: collections,
    tags: tags,
    date: date
  });
  res.location('/images/view/' + name[0] + '/');
  res.redirect('/images/view/' + name[0] + '/');
});
router.post('/remove/:id/', isAuth, isOwner, function (req, res) {
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    if (image['username'] + req.user.username) {
      images.remove({
        name: req.params.id
      }).then(function () {
        var dirName = (__dirname + '').split('/');

        dirName.pop();
        var staticPath = '';
        dirName.forEach(function (folder) {
          staticPath += folder + '/';
        });
        staticPath += 'static'; // image['thumbnail']
        // image['location']

        try {
          fs.unlinkSync(pathToRemovedPic + image['thumbnail']);
          fs.unlinkSync(pathToRemovedPic + image['location']);
        } catch (error) {
          console.log("Delete error: ".concat(error));
        }

        res.location('/users/myprofile');
        res.redirect('/users/myprofile');
      });
    }
  });
});
module.exports = router;