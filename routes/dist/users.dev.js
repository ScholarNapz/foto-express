"use strict";

var express = require('express');

var router = express.Router();

var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy; //? DB


var mongodb = require('mongodb');

var db = require('monk')('localhost/fotodb');
/* GET users listing. */


router.get('/', // ensureAuthenticated,
function (req, res, next) {
  //!------CHANGE ALL INSTANCES OF MARIO
  var db = req.db;
  var users = db.get('users');
  var images = db.get('images');
  var user = null;
  var collectionList = [];
  var collectionThumbnail = [];
  var collectionObj = {};
  users.findOne({
    username: 'mario'
  }).then(function (users) {
    user = users;
  }); // users.findOne({ username: 'mario' }).then((users) => {
  //     // collectionList = users;
  // });

  users.findOne({
    username: 'mario'
  }, 'collections').then(function (userColls) {
    var collections = JSON.parse(JSON.stringify(userColls)).collections;

    if (collections.length > 0) {
      collections.forEach(function (element) {
        collectionList.push(element);
        images.findOne({
          username: 'mario',
          collections: [element]
        }).then(function (img) {
          var image = JSON.parse(JSON.stringify(img)).thumbnail; // collectionThumbnail.push(image);
          // console.log(image);

          collectionObj[element] = image;
        });
      });
    }

    images.find({
      username: 'mario'
    }, {}).then(function (images) {
      res.render('user', {
        images: images,
        user: user,
        colls: collectionObj // colls: collectionList,
        // collsThumb: collectionThumbnail

      });
    });
    console.log(JSON.parse(JSON.stringify(userColls)).collections);
  });
  console.log('...1');
  console.log(collectionList);
  console.log('...2');
  console.log(collectionThumbnail); // images.find({ username: 'mario' }, {}).then((images) => {
  //     res.render('user', {
  //         images: images,
  //         user: user,
  //         colls: collectionList,
  //         collsThumb: collectionThumbnail
  //     });
  // });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated) {
    return next();
  }
}

router.get('/logout', function (req, res) {
  req.logOut();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
}); // router.post('/login', passport.authenticate('local', { failureRedirect: '/', failureFlash: 'Invalid Username or Password' }), [
//         body('username', 'Username is Required').not().isEmpty(),
//         body('password', 'Password is Required').not().isEmpty(),
//     ],
//     function(req, res, next) {
//         let username = req.body.username;
//         let password = req.body.password;
//         const errors = validationResult(req);
//         console.log(errors);
//         if (!errors.isEmpty()) {
//             res.render('landing', {
//                 errors: errors.array()
//             });
//         } else {
//             // If there is no error do this
//             req.flash('success', 'Login Successful')
//                 // res.redirect('/users/' + req.user.username);
//             console.log('No Errors...');
//         };
//     });

module.exports = router; // const mongoConnect = require('../models/user');
// mongoConnect((users) => {
//     console.log(users);
// });