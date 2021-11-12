"use strict";

var express = require('express');

var router = express.Router();

var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy; //? DB


var mongodb = require('mongodb');

var db = require('monk')('localhost/fotodb');

function upload(e) {
  res.render('/users/upload');
}
/* GET users listing. */


router.get('/', // ensureAuthenticated,
function (req, res, next) {
  var db = req.db;
  var users = db.get('users');
  var images = db.get('images'); //!------CHANGE ALL INSTANCES OF MARIO

  var getCollectionImages = function getCollectionImages(collections, username) {
    return new Promise(function (resolve, reject) {
      var collectionObj = {};
      collections.forEach(function (element) {
        images.findOne({
          username: username,
          collections: [element]
        }).then(function (img) {
          if (img !== null) {
            var image = JSON.parse(JSON.stringify(img)).thumbnail;
            collectionObj[element] = image;
          } else {
            users.update({
              username: username
            }, {
              $pull: {
                collections: element
              }
            });
          }
        });
      });
      setTimeout(function () {
        resolve(collectionObj);
      }, 5);
    });
  };

  var getCollectionDetails = function getCollectionDetails(username) {
    return new Promise(function (resolve, reject) {
      users.findOne({
        username: username
      }, 'collections').then(function (userColls) {
        var collections = JSON.parse(JSON.stringify(userColls)).collections;

        if (collections.length > 0) {
          getCollectionImages(collections, username).then(function (collList) {
            resolve(collList);
          });
        } else {
          resolve('{}');
        }
      });
    });
  };

  var createUserPage = function createUserPage(user) {
    return new Promise(function (resolve, reject) {
      var username = JSON.parse(JSON.stringify(user)).username;
      images.find({
        username: username
      }, {}).then(function (images) {
        getCollectionDetails(username).then(function (colls) {
          res.render('user', {
            images: images,
            user: user,
            colls: colls
          });
          resolve('Done');
        });
      });
    });
  };

  users.findOne({
    username: 'mario'
  }).then(function (user) {
    createUserPage(user).then(function (result) {});
  });
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