"use strict";

var express = require('express');

var router = express.Router();

var fs = require('fs');

var _require = require('express-validator'),
    body = _require.body,
    validationResult = _require.validationResult; //! to format date string


var moment = require('moment'); //! to get full path of of file- to rip extension


require('dotenv').config();

var path = require('path');

var sharp = require('sharp');

var isAuth = require('../lib/authMiddleware').isAuth;

var alert = require('alert');

var port = process.env.PORT;

function userExistsAdmin(req, res, next) {
  req.db.get('users').findOne({
    username: req.body.addadmin
  }).then(function (user) {
    try {
      if (user.username !== '') {
        console.log(user.username);
        console.log(user.username);
        req.db.get('images').findOne({
          name: req.params.id
        }).then(function (image) {
          if (user.username === image.username) {
            alert('Owner Cannot Be Added');
            res.location('/images/view/' + req.params.id + '/#addadmin');
            res.redirect('/images/view/' + req.params.id + '/##addadmin');
          } else {
            next();
          }
        });
      }
    } catch (error) {
      alert('User Does Not Exist');
      res.location('/images/view/' + req.params.id + '/#addadmin');
      res.redirect('/images/view/' + req.params.id + '/##addadmin');
    }
  });
}

function userExistsShared(req, res, next) {
  req.db.get('users').findOne({
    username: req.body.addshared
  }).then(function (user) {
    try {
      if (user.username !== '') {
        console.log(user.username);
        console.log(user.username);
        req.db.get('images').findOne({
          name: req.params.id
        }).then(function (image) {
          if (user.username === image.username) {
            alert('Owner Cannot Be Added');
            res.location('/images/view/' + req.params.id + '/#addshares');
            res.redirect('/images/view/' + req.params.id + '/#addshared');
          } else {
            next();
          }
        });
      }
    } catch (error) {
      alert('User Does Not Exist');
      res.location('/images/view/' + req.params.id + '/#addadmin');
      res.redirect('/images/view/' + req.params.id + '/##addadmin');
    }
  });
}

function isOwnerOrAdmin(req, res, next) {
  console.log(req.params.id);
  req.db.get('images').findOne({
    name: req.params.id
  }).then(function (image) {
    console.log('Check if owner');
    console.log("image user: ".concat(image['username']));
    console.log("user: ".concat(req.user.username));

    if (image['username'] === req.user.username) {
      next();
    } else {
      console.log('Check if Admin');
      console.log(req.params.id);
      req.db.get('images').findOne({
        name: req.params.id
      }).then(function (image) {
        try {
          console.log('inside try');
          console.log(image);
          console.log(image['admins']);

          if (image['admins'].length === 0) {
            console.log('redirect');
            res.render('viewImage', {
              title: 'image.name',
              username: req.user.username,
              image: image
            });
          } else {
            for (var i = 0; i < image['admins'].length; i++) {
              var element = image['admins'][i];
              console.log(element);
              console.log(req.user.username);

              if (element === req.user.username) {
                console.log('admin success');
                next();
              }

              if (i + 1 > image['admins'].length) {
                console.log('Not Admin');
                res.render('viewImage', {
                  title: 'image.name',
                  username: req.user.username,
                  image: image
                });
              }
            }
          }
        } catch (error) {
          console.log('inside catch');
          res.render('viewImage', {
            title: 'image.name',
            username: req.user.username,
            image: image
          });
          next();
        }
      });
    }
  });
}

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
    cb(null, false); // cb(new Error('File is not in image format.'), false);
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
router.get('/view/:id/', isOwnerOrAdmin, function (req, res, next) {
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    res.render('editImage', {
      title: 'image.name',
      username: req.user.username,
      date: moment(image.date).format('D / M / Y'),
      image: image
    });
  });
});
router.get('/download/:id/', function (req, res, next) {
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    console.log(image);
    var imagePath = 'static' + image.location;
    console.log('...');
    console.log(imagePath);
    res.download(imagePath), function () {
      console.log('...download'); // res.location('/images/view/' + req.params.id + '/#addtag');
      // res.redirect('/images/view/' + req.params.id + '/#addtag');
    }; // ,function(error) {
    //         console.log("Error : ", error)
    //     });
  });
});
router.get('/edit/:id/removetag/:tag/', isOwnerOrAdmin, function (req, res, next) {
  var images = req.db.get('images');
  images.update({
    name: req.params.id
  }, {
    $pull: {
      'tags': req.params.tag
    }
  }).then(function () {
    res.location('/images/view/' + req.params.id + '/#addtag');
    res.redirect('/images/view/' + req.params.id + '/#addtag');
  });
});
router.get('/edit/:id/removecollection/:collection', isOwnerOrAdmin, function (req, res, next) {
  var images = req.db.get('images');
  console.log('About to remove collection');
  console.log(req.params.id);
  console.log(req.params.collection);
  images.update({
    name: req.params.id
  }, {
    $pull: {
      'collections': req.params.collection
    }
  }).then(function () {
    res.location('/images/view/' + req.params.id + '/#addcollection');
    res.redirect('/images/view/' + req.params.id + '/#addcollection');
  });
});
router.get('/edit/:id/removeadmin/:admin/', isOwnerOrAdmin, function (req, res, next) {
  var images = req.db.get('images');
  console.log('About to remove admin');
  console.log(req.params.id);
  console.log(req.params.admin);
  images.update({
    name: req.params.id
  }, {
    $pull: {
      'admins': req.params.admin
    }
  }).then(function () {
    res.location('/images/view/' + req.params.id + '/#addadmin');
    res.redirect('/images/view/' + req.params.id + '/#addadmin');
  });
});
router.get('/edit/:id/removeshared/:shared/', isOwnerOrAdmin, function (req, res, next) {
  var images = req.db.get('images');
  console.log('About to remove shared');
  console.log(req.params.id);
  console.log(req.params.shared);
  images.update({
    name: req.params.id
  }, {
    $pull: {
      shared: req.params.shared
    }
  }).then(function (i) {
    console.log(i);
    res.location('/images/view/' + req.params.id + '/#addshared');
    res.redirect('/images/view/' + req.params.id + '/#addshared');
  });
});
router.post('/edit/:id/addtag/', isOwnerOrAdmin, [body('addtag', 'empty').trim().escape(), body('addtag', 'empty').not().isEmpty()], function (req, res, next) {
  // 
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
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
  });
});
router.post('/edit/:id/addcollection', isOwnerOrAdmin, [body('addcollection', 'empty').trim().escape(), body('addcollection', 'empty').not().isEmpty()], function (req, res, next) {
  console.log('In add collection function');
  var images = req.db.get('images');
  var user = req.db.get('users');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    if (validationResult(req).isEmpty() && req.body.addcollection.trim() !== '' && req.body.addcollection.trim() !== '.' && req.body.addcollection.trim() !== '?') {
      images.find({
        name: req.params.id,
        collections: {
          $in: [req.body.addcollection]
        }
      }).then(function (col) {
        console.log('image found');
        console.log(col);

        if (col.length === 0 || null) {
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
  });
});
router.post('/edit/:id/addadmin/', isOwnerOrAdmin, [body('addadmin', 'empty').trim().escape(), body('addadmin', 'empty').not().isEmpty()], userExistsAdmin, function (req, res, next) {
  console.log('addadmin started');
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    if (validationResult(req).isEmpty() && req.body.addadmin.trim() !== '' && req.body.addadmin.trim() !== '.' && req.body.addadmin.trim() !== '?') {
      images.find({
        name: req.params.id,
        admins: {
          $in: [req.body.addadmin]
        }
      }).then(function (admin) {
        if (admin.length === 0) {
          images.update({
            name: req.params.id
          }, {
            $push: {
              admins: req.body.addadmin
            }
          }).then(function (admin) {
            res.location('/images/view/' + req.params.id + '/#addadmin');
            res.redirect('/images/view/' + req.params.id + '/#addadmin');
          });
        } else {
          res.location('/images/view/' + req.params.id + '/#addadmin');
          res.redirect('/images/view/' + req.params.id + '/##addadmin');
        }
      });
    } else {
      res.location('/images/view/' + req.params.id + '/#addadmin');
      res.redirect('/images/view/' + req.params.id + '/#addadmin');
    }

    ;
  });
});
router.post('/edit/:id/addshared/', isOwnerOrAdmin, [body('addshared', 'empty').trim().escape(), body('addshared', 'empty').not().isEmpty()], userExistsShared, function (req, res, next) {
  console.log('addshared started');
  var images = req.db.get('images');
  images.findOne({
    name: req.params.id
  }).then(function (image) {
    if (validationResult(req).isEmpty() && req.body.addshared.trim() !== '' && req.body.addshared.trim() !== '.' && req.body.addshared.trim() !== '?') {
      images.find({
        name: req.params.id,
        shared: {
          $in: [req.body.addshared]
        }
      }).then(function (shared) {
        if (shared.length === 0) {
          images.update({
            name: req.params.id
          }, {
            $push: {
              shared: req.body.addshared
            }
          }).then(function (shared) {
            res.location('/images/view/' + req.params.id + '/#addshared');
            res.redirect('/images/view/' + req.params.id + '/#addshared');
          });
        } else {
          res.location('/images/view/' + req.params.id + '/#addshared');
          res.redirect('/images/view/' + req.params.id + '/##addshared');
        }
      });
    } else {
      res.location('/images/view/' + req.params.id + '/#addshared');
      res.redirect('/images/view/' + req.params.id + '/#addshared');
    }

    ;
  });
});
router.post('/edit/:id/description/', isOwnerOrAdmin, [body('description', 'empty').trim().escape(), body('description', 'empty').not().isEmpty()], function (req, res, next) {
  var images = req.db.get('images');
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
});
router.post('/upload', isAuth, upload.single('upload-image'), function (req, res, next) {
  if (imageName != null) {
    var dirName = (__dirname + '').split('/');

    dirName.pop();
    var staticPath = '';
    dirName.forEach(function (folder) {
      staticPath += folder + '/';
    }); //! Convert imageName upload/<Imagefile> to 300x300 and save in thumbnails/<ImageName>

    if (imageName.split('.').pop() !== '.gif') {
      fs.copyFile(staticPath + 'static/uploads/' + imageName, staticPath + 'static/thumbnails/' + imageName, function (err) {
        console.log('Uplaod Error');
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
    var admins = [];
    var shared = [];
    var date = moment().toISOString();
    images.insert({
      name: name[0],
      location: imageLoc,
      thumbnail: thumbnailLoc,
      username: username,
      description: description,
      collections: collections,
      tags: tags,
      admins: admins,
      shared: shared,
      date: date
    });
    res.location('/images/view/' + name[0] + '/');
    res.redirect('/images/view/' + name[0] + '/');
  } else {
    res.location('/gallery/');
    res.redirect('/gallery/');
  }
});
router.post('/remove/:id/', isAuth,
/*isOwner,*/
function (req, res) {
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
          fs.unlinkSync(staticPath + image['thumbnail']);
          fs.unlinkSync(staticPath + image['location']);
        } catch (error) {
          console.log("Delete error: ".concat(error));
        }

        alert('Image Is Removed');
        res.location('/users/myprofile');
        res.redirect('/users/myprofile');
      });
    }
  });
});
module.exports = router;