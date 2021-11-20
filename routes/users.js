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


router.get('/logout', function(req, res, ) {
    req.logOut();
    req.flash('success', 'You are now logged out');
    res.redirect('/');
});


/* GET users listing. */
router.get('/profile/:usr',
    function(req, res, next) {
        const db = req.db;
        const users = db.get('users')
        const images = db.get('images');
        // if (typeof myVar === 'undefined'){}
        console.log('123');
        console.log(req.user.username);
        console.log(req.params.usr);

        users.findOne({ username: req.params.usr }).then((user) => {

            console.log('...1');
            console.log(req.params.usr);
            console.log(user.collections);
            getCollectionImages(unique(user.collections), user.username).then((collection) => {
                images.find({ username: user.username }).then((imgs) => {
                    console.log('..6');

                    console.log(imgs);
                    res.render('user', {
                        images: imgs,
                        user: user,
                        colls: collection
                    });
                });
            })
        });

        function unique(collections) {
            return collections.sort().filter(function(item, pos, ary) {
                return !pos || item != ary[pos - 1];
            });
        }

        const getCollectionImages = (collections, username) => {
            let collectionObj = {}

            return new Promise((resolve, reject) => {
                let itemsDone = 0;
                collections.forEach(element => {
                    images.findOne({ username: username }).then((image) => {

                        collectionObj[element] = image.thumbnail;
                        itemsDone++;
                        if (itemsDone === collections.length) {

                            resolve(collectionObj);
                        }
                    });
                });
            });
        };

        // const getImageLocations = (collections, username) => {
        //     let collectionObj = {}

        //     return new Promise((resolve, reject) => {
        //         let itemsDone = 0;
        //         collections.forEach(element => {
        //             images.findOne({ username: username }).then((image) => {

        //                 collectionObj[element] = image.name;
        //                 itemsDone++;
        //                 if (itemsDone === collections.length) {

        //                     resolve(collectionObj);
        //                 }
        //             });
        //         });

        //     });
        // });

        // const getCollectionImages = (collections, username) => {
        //     return new Promise((resolve, reject) => {
        //         let collectionObj = {};
        //         foundAlbums = false;

        //         collections.forEach(element => {
        //             images.findOne({ username: username, collections: [element] }).then((img) => {
        //                 if (img !== null) {
        //                     const image = JSON.parse(JSON.stringify(img)).thumbnail;
        //                     collectionObj[element] = image;
        //                 } else {
        //                     users.update({ username: username }, { $pull: { collections: element } });
        //                 }

        //             });
        //         });

        //         setTimeout(() => {
        //             resolve(collectionObj);
        //         }, 50);
        //     });
        // };

        // const getCollectionDetails = (username) => {
        //     return new Promise((resolve, reject) => {

        //         // users.findOne({ username: username }, 'collections').then((userColls) => {
        //         users.findOne({ username: username }, 'collections').then((userColls) => {

        //             const collections = JSON.parse(JSON.stringify(userColls)).collections;
        //             console.log('-');

        //             console.log(collections);


        //             if (collections.length > 0) {

        //                 getCollectionImages(collections, username).then(collList => {
        //                     resolve(collList);
        //                 });
        //             } else {
        //                 resolve('{}');
        //             }
        //         });



        //     });
        // };

        // const createUserPage = (user) => {
        //     return new Promise((resolve, reject) => {
        //         const username = JSON.parse(JSON.stringify(user)).username;
        //         // console.log(username);

        //         images.find({ username: username }).then((images) => {

        //             console.log(images);

        //             getCollectionDetails(username).then((colls) => {
        //                 resolve(colls);
        //             });

        //         });
        //     });
        // };

        // users.findOne({ username: req.params.usr }).then((user) => {
        //     // console.log(user);
        //     createUserPage(user).then((colls) => {
        //         console.log();
        //         console.log(images);
        //         res.render('user', {
        //             images: images,
        //             user: user,
        //             colls: colls
        //         });
        //     });
        // });

    });



// function ensureAuthenticated(req, res, next) {
//     if (req.isAuthenticated) {
//         return next();
//     }
// }

module.exports = router;