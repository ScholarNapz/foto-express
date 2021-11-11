var express = require('express');
var router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//? DB
const mongodb = require('mongodb');
const db = require('monk')('localhost/fotodb');


/* GET users listing. */
router.get('/',
    // ensureAuthenticated,
    function(req, res, next) {
        //!------CHANGE ALL INSTANCES OF MARIO
        const db = req.db;
        const users = db.get('users')
        const images = db.get('images');

        let user = null;
        let collectionList = [];

        let collectionThumbnail = [];

        let collectionObj = {}
        users.findOne({ username: 'mario' }).then((users) => {
            user = users;
        });
        // users.findOne({ username: 'mario' }).then((users) => {
        //     // collectionList = users;

        // });

        users.findOne({ username: 'mario' }, 'collections').then((userColls) => {
            const collections = JSON.parse(JSON.stringify(userColls)).collections;

            if (collections.length > 0) {
                collections.forEach(element => {
                    collectionList.push(element);

                    images.findOne({ username: 'mario', collections: [element] }).then((img) => {
                        const image = JSON.parse(JSON.stringify(img)).thumbnail;
                        // collectionThumbnail.push(image);
                        // console.log(image);
                        collectionObj[element] = image;
                    });
                });

            }

            images.find({ username: 'mario' }, {}).then((images) => {
                res.render('user', {
                    images: images,
                    user: user,
                    colls: collectionObj
                        // colls: collectionList,
                        // collsThumb: collectionThumbnail
                });
            });



            console.log(JSON.parse(JSON.stringify(userColls)).collections);
        });

        console.log('...1');
        console.log(collectionList);
        console.log('...2');
        console.log(collectionThumbnail);

        // images.find({ username: 'mario' }, {}).then((images) => {
        //     res.render('user', {
        //         images: images,
        //         user: user,
        //         colls: collectionList,
        //         collsThumb: collectionThumbnail
        //     });
        // });

    }

);

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