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

router.get('/', (req, res, next) => {
    const users = db.get('users');
    users.find({ $nor: [{ $and: [{ 'username': req.user.username }] }] }).then(usr => {
        res.render('users', { title: 'Users', username: req.user.username, users: usr });
    });
});


/* GET users listing. */
router.get('/profile/:id/',
    function(req, res, next) {
        const users = db.get('users')
        const images = db.get('images');
        console.log(req.user.username);
        console.log(req.params.id);
        if (req.user.username === req.params.id) {
            res.location('/users/myprofile');
            res.redirect('/users/myprofile');
        } else {
            const users = db.get('users')
            const images = db.get('images');
            console.log('qweasdzxcqweasdzxc');
            console.log(req.params.id);
            users.findOne({ username: req.params.id }).then((user) => {
                getCollectionImages(unique(user.collections), user.username).then((collection) => {
                    console.log('BWEWB');
                    console.log(collection);
                    images.find({ username: user.username }).then((imgs) => {

                        res.render('user', {
                            title: user.username,
                            username: req.user.username,
                            images: imgs,
                            user: user,
                            colls: collection
                        });
                    });
                })
            });
        }

        function unique(collections) {
            return collections.sort().filter(function(item, pos, ary) {
                return !pos || item != ary[pos - 1];
            });
        }

        const getCollectionImages = (collections, username) => {
            let collectionObj = {}

            return new Promise((resolve, reject) => {
                if (collections.length == 0) {
                    resolve(collectionObj);
                } else {
                    let itemsDone = 0;
                    collections.forEach(element => {
                        images.findOne({ username: username, collections: { $in: [element] } }).then((image) => {

                            try {
                                collectionObj[element] = image['thumbnail']
                            } catch (error) {
                                users.update({ username: username }, { $pull: { 'collections': element } });
                            }
                            itemsDone++;
                            if (itemsDone === collections.length) {
                                console.log('ohoho');
                                console.log(collectionObj);
                                resolve(collectionObj);
                            }
                        });
                    });
                }
            });
        };
    });


router.get('/myprofile',
    function(req, res, next) {
        const users = db.get('users')
        const images = db.get('images');
        console.log('qweasdzxcqweasdzxc');
        console.log(req.user.username);
        users.findOne({ username: req.user.username }).then((user) => {
            console.log('qweasdzxcqweasdzxc');
            console.log(req.user.username);
            getCollectionImages(unique(user.collections), user.username).then((collection) => {
                console.log('BWEWB');
                console.log(collection);
                images.find({ username: user.username }).then((imgs) => {

                    res.render('user', {
                        title: user.username,
                        username: req.user.username,
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
                if (collections.length == 0) {
                    resolve(collectionObj);
                } else {
                    let itemsDone = 0;
                    collections.forEach(element => {
                        images.findOne({ username: username, collections: { $in: [element] } }).then((image) => {

                            try {
                                collectionObj[element] = image['thumbnail']
                            } catch (error) {
                                users.update({ username: username }, { $pull: { 'collections': element } });
                            }
                            itemsDone++;
                            if (itemsDone === collections.length) {
                                console.log('ohoho');
                                console.log(collectionObj);
                                resolve(collectionObj);
                            }
                        });
                    });
                }
            });
        };
    });

// if (validationResult(req).isEmpty() && (req.body.addtag.trim() !== '') && (req.body.addtag.trim() !== '.') && (req.body.addtag.trim() !== '?')) {
//     images.find({ name: req.params.id, tags: { $in: [req.body.addtag] } }).then((tag) => {

//         if (tag.length === 0) {
//             images.update({ name: req.params.id }, { $push: { tags: req.body.addtag } }).then((image) => {
//                 res.location('/images/view/' + req.params.id + '/#addtag');
//                 res.redirect('/images/view/' + req.params.id + '/#addtag');
//             });


router.post('/profile/search', (req, res) => {
    res.location('/users/profile/search/' + req.body.search);
    res.redirect('/users/profile/search/' + req.body.search);
});

router.get('/profile/search/:id', (req, res) => {

    console.log("|?|?|?|??|");
    const users = req.db.get('users');
    users.find({ username: { $regex: ".*" + req.params.id + ".*" } }, { sort: { date: -1 } }).then((usr) => {
        console.log("asdfasdfqawe");
        console.log(usr);
        res.render('users', { title: 'Usernames containing "' + req.params.id + '"', users: usr });
    })
});

router.get('/logout', function(req, res, ) {
    req.logOut();
    req.flash('success', 'You are now logged out');
    res.redirect('/');
});

// function ensureAuthenticated(req, res, next) {
//     if (req.isAuthenticated) {
//         return next();
//     }
// }

module.exports = router;