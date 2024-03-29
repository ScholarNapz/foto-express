const express = require('express');
const router = express.Router();
const passport = require('passport');
const isAuth = require('../lib/authMiddleware').isAuth;
const fs = require('fs');
const sharp = require('sharp');
//? for py script image converter 
//* abandon on deployment - desync issue 
// const { exec } = require("child_process");
//? DB
const db = require('monk')('localhost/fotodb');
// const users = db.get('users');

let imageName = null;

//! file uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'static/.temp/');
    },
    filename: (req, file, cb) => {
        imageName = req.user.username + '.' + file.originalname.split('.').pop();
        cb(null, imageName);
    }
});

//! validate file type by mime
const fileFilter = (req, file, cb) => {
    //? reject file cb(null, false)
    //? accept file cb(null, true)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/pjpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/bmp') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,

    limits: { //? set file upload limit
        fileSize: 1024 * 1024 * 15 //! Max upload of 15mb
    },

    fileFilter: fileFilter
});

router.post('/upload', isAuth, upload.single('upload-image'), (req, res, next) => {

    if (imageName != null) {
        const users = db.get('users');
        let dirName = (__dirname + '').split('/');
        dirName.pop();
        let staticPath = '';
        dirName.forEach(folder => {
            staticPath += folder + '/';
        });
        console.log(imageName);
        //! Convert imageName upload/<Imagefile> to 300x300 and save in thumbnails/<ImageName>
        sharp(staticPath + 'static/.temp/' + imageName)
            .resize(300, 300)
            .toFile(staticPath + 'static/profileimages/' + imageName, (err, info) => {
                console.log('converted');

            });
        // }

        users.update({ username: req.user.username }, { $set: { profileimage: '/profileimages/' + imageName } }).then(() => {
            console.log('profile image update');
            res.location('/users/myprofile/');
            res.redirect('/users/myprofile/');
        });
    } else {

        res.location('/users/myprofile/');
        res.redirect('/users/myprofile/');
    }

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

/* GET users listing. */
router.get('/profile/:id/', isAuth, (req, res) => {
    if (req.user.username === req.params.id) {
        res.location('/users/myprofile');
        res.redirect('/users/myprofile');
    } else {
        const users = db.get('users')
        const images = db.get('images');
        users.findOne({ username: req.params.id }).then((user) => {
            getCollectionImages(unique(user.collections), user.username, images, users).then((collection) => {
                getSharedImages(user.username, images).then((shared) => {
                    images.find({ username: user.username }).then((userImgs) => {
                        // console.log(shared);
                        res.render('user', {
                            title: user.username,
                            username: req.user.username,
                            images: userImgs,
                            user: user,
                            shared: shared,
                            colls: collection
                        });
                    });
                });
            });
        });
    }
});


router.get('/myprofile', isAuth, (req, res) => {
    const users = db.get('users')
    const images = db.get('images');
    users.findOne({ username: req.user.username }).then((user) => {
        getCollectionImages(unique(user.collections), user.username, images, users).then((collection) => {
            getSharedImages(user.username, images).then((shared) => {
                getAdminImages(user.username, images).then((admin) => {
                    images.find({ username: user.username }).then((userImgs) => {

                        console.log("-----SHARED IMGS-------------------");
                        console.log(shared);
                        console.log("-----ADMIN IMGS-------------------");
                        console.log(admin);
                        res.render('myprofile', {
                            title: user.username,
                            username: req.user.username,
                            images: userImgs,
                            user: user,
                            shared: shared,
                            admin: admin,
                            colls: collection
                        });
                    });
                });
            });
        })
    });
});

/*-------------------------------
* FIND COLLECTIONS TO POPULATE COLLECTIONS OF USER
-------------------------------------*/
function unique(collections) {
    return collections.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

const getCollectionImages = (collections, username, images, users) => {
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
                        resolve(collectionObj);
                    }
                });
            });
        }
    });
};


const getSharedImages = (username, images) => {
    let shareObj = {}
    return new Promise((resolve, reject) => {
        images.find({ shared: { $in: [username] } }).then((imgs) => {
            const jsn = JSON.parse(JSON.stringify(imgs));
            var arr = [];
            arr = jsn;
            if (arr.length == 0) {
                resolve(shareObj);
            } else {
                let itemsDone = 0;
                arr.forEach(elm => {
                    shareObj[elm.name] = elm.thumbnail
                    itemsDone++;
                    if (itemsDone === arr.length) {
                        resolve(shareObj);
                    }
                });
            }
        });
    });
};

const getAdminImages = (username, images) => {
    let adminObj = {}
    return new Promise((resolve, reject) => {
        images.find({ admins: { $in: [username] } }).then((imgs) => {
            const jsn = JSON.parse(JSON.stringify(imgs));
            var arr = [];
            arr = jsn;
            if (arr.length == 0) {
                resolve(adminObj);
            } else {
                let itemsDone = 0;
                arr.forEach(elm => {
                    adminObj[elm.name] = elm.thumbnail
                    itemsDone++;
                    if (itemsDone === arr.length) {
                        resolve(adminObj);
                    }
                });
            }
        });
    });
};

router.post('/profile/search', isAuth, (req, res) => {
    res.location('/users/profile/search/' + req.body.search);
    res.redirect('/users/profile/search/' + req.body.search);
});

router.get('/profile/search/:id', isAuth, (req, res) => {

    const users = req.db.get('users');
    users.find({ username: { $regex: ".*" + req.params.id + ".*" } }, { sort: { date: -1 } }).then((usr) => {
        res.render('users', { title: 'Usernames containing "' + req.params.id + '"', users: usr });
    })
});

router.get('/logout', isAuth, (req, res) => {
    req.logOut();
    req.flash('success', 'You are now logged out');
    res.redirect('/');
});

module.exports = router;