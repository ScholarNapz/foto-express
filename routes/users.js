var express = require('express');
var router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//? DB
const mongodb = require('mongodb');
const db = require('monk')('localhost/fotodb');


function upload(e) {
    res.location('/images/upload');
    res.redirect('/images/upload');
}

/* GET users listing. */
router.get('/',
    // ensureAuthenticated,
    function(req, res, next) {
        const db = req.db;
        const users = db.get('users')
        const images = db.get('images');

        //!------CHANGE ALL INSTANCES OF MARIO

        const getCollectionImages = (collections, username) => {
            return new Promise((resolve, reject) => {
                let collectionObj = {};
                foundAlbums = false;

                collections.forEach(element => {
                    images.findOne({ username: username, collections: [element] }).then((img) => {
                        if (img !== null) {
                            const image = JSON.parse(JSON.stringify(img)).thumbnail;
                            collectionObj[element] = image;
                        } else {
                            users.update({ username: username }, { $pull: { collections: element } });
                        }

                    });
                });

                setTimeout(() => {
                    resolve(collectionObj);
                }, 5);
            });
        };

        const getCollectionDetails = (username) => {
            return new Promise((resolve, reject) => {


                users.findOne({ username: username }, 'collections').then((userColls) => {

                    const collections = JSON.parse(JSON.stringify(userColls)).collections;
                    if (collections.length > 0) {

                        getCollectionImages(collections, username).then(collList => {
                            resolve(collList);
                        });
                    } else {
                        resolve('{}');
                    }
                });



            });
        };

        const createUserPage = (user) => {
            return new Promise((resolve, reject) => {
                const username = JSON.parse(JSON.stringify(user)).username;

                images.find({ username: username }, {}).then((images) => {

                    getCollectionDetails(username).then((colls) => {
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

        users.findOne({ username: 'mario' }).then((user) => {
            createUserPage(user).then((result) => {});
        });

    });

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated) {
        return next();
    }
}


router.get('/logout', function(req, res, ) {
    req.logOut();
    req.flash('success', 'You are now logged out');
    res.redirect('/');
});





// router.post('/login', passport.authenticate('local', { failureRedirect: '/', failureFlash: 'Invalid Username or Password' }), [
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




module.exports = router;


// const mongoConnect = require('../models/user');

// mongoConnect((users) => {
//     console.log(users);
// });