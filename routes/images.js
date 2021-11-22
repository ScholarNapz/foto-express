var express = require('express');
var router = express.Router();
var fs = require('fs');
const { body, validationResult } = require('express-validator');
//! to format date string
const moment = require('moment');
//! to get full path of of file- to rip extension
require('dotenv').config();
const path = require('path');
const sharp = require('sharp');
const isAuth = require('../lib/authMiddleware').isAuth;

let port = process.env.PORT

function isOwnerOrAdmin(req, res, next) {
    console.log(req.params.id);
    req.db.get('images').findOne({ name: req.params.id }).then((image) => {
        console.log('Check if owner');
        if (image['username'] === req.user.username) {

            next();

        } else {
            console.log('Check if Admin');
            console.log(req.params.id);
            req.db.get('images').findOne({ name: req.params.id }).then((image) => {
                try {
                    console.log('inside try');
                    console.log(image);
                    console.log(image['admins']);
                    if (image['admins'].length === 0) {
                        console.log('redirect');
                        res.render('viewImage', { title: 'image.name', username: req.user.username, image: image });
                    } else {

                        for (let i = 0; i < image['admins'].length; i++) {
                            const element = image['admins'][i];
                            console.log(element);
                            console.log(req.user.username);
                            if (element === req.user.username) {
                                console.log('admin success');
                                next();
                            }

                            if (i + 1 >= image['admins'].length) {
                                console.log('Not Admin');
                                res.render('viewImage', { title: 'image.name', username: req.user.username, image: image });
                                next();
                            }
                        }
                    }

                } catch (error) {
                    console.log('inside catch');
                    res.render('viewImage', { title: 'image.name', username: req.user.username, image: image });
                    next();
                }
            });
            // res.location('/images/view/' + req.params.id + '/#')
            // res.redirect('/images/view/' + req.params.id + '/#')
        }


    });
}


let imageName = null

//! file uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'static/uploads/');
    },
    filename: (req, file, cb) => {
        imageName = moment(new Date()).format('YMDHHmmssSSSS') + '.' + file.originalname.split('.').pop();
        cb(null, imageName);
    }
});

//! validate file type by mime
const fileFilter = (req, file, cb) => {
    //? reject file cb(null, false)
    //? accept file cb(null, true)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/pjpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/bmp' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(null, false);
        // cb(new Error('File is not in image format.'), false);
    }
};


const upload = multer({
    storage: storage,

    limits: { //? set file upload limit
        fileSize: 1024 * 1024 * 15 //! Max upload of 15mb
    },

    fileFilter: fileFilter
});


/* GET home page. */

router.get('/upload', isAuth, function(req, res, next) {
    res.render('upload', { title: 'Uplaod', username: req.user.username });
});

router.get('/view/:id/', isOwnerOrAdmin, function(req, res, next) {
    const images = req.db.get('images');
    images.findOne({ name: req.params.id }).then((image) => {
        res.render('editImage', { title: 'image.name', username: req.user.username, date: moment(image.date).format('D / M / Y'), image: image });
    });
});

router.get('/download/:id/', function(req, res, next) {
    const images = req.db.get('images');

    images.findOne({ name: req.params.id }).then((image) => {
        console.log(image);
        let imagePath = 'static' + image.location;
        console.log('...');
        console.log(imagePath);
        res.download(imagePath), () => {
                console.log('...download');
                // res.location('/images/view/' + req.params.id + '/#addtag');
                // res.redirect('/images/view/' + req.params.id + '/#addtag');
            }
            // ,function(error) {
            //         console.log("Error : ", error)
            //     });

    });

});



router.get('/edit/:id/removetag/:tag/', isOwnerOrAdmin, function(req, res, next) {

    const images = req.db.get('images');
    images.update({ name: req.params.id }, { $pull: { 'tags': req.params.tag } }).then(() => {
        res.location('/images/view/' + req.params.id + '/#addtag');
        res.redirect('/images/view/' + req.params.id + '/#addtag');
    });
});

router.get('/edit/:id/removecollection/:collection', isOwnerOrAdmin, (req, res, next) => {

    const images = req.db.get('images');
    console.log('About to remove collection');
    console.log(req.params.id);
    console.log(req.params.collection);
    images.update({ name: req.params.id }, { $pull: { 'collections': req.params.collection } }).then(() => {
        res.location('/images/view/' + req.params.id + '/#addcollection');
        res.redirect('/images/view/' + req.params.id + '/#addcollection');
    });
});

router.get('/edit/:id/removeadmin/:admin/', isOwnerOrAdmin, (req, res, next) => {

    const images = req.db.get('images');
    console.log('About to remove admin');
    console.log(req.params.id);
    console.log(req.params.admin);
    images.update({ name: req.params.id }, { $pull: { 'admins': req.params.admin } }).then(() => {
        res.location('/images/view/' + req.params.id + '/#addadmin');
        res.redirect('/images/view/' + req.params.id + '/#addadmin');
    });
});

router.get('/edit/:id/removeshared/:shared/', isOwnerOrAdmin, (req, res, next) => {

    const images = req.db.get('images');
    console.log('About to remove shared');
    console.log(req.params.id);
    console.log(req.params.shared);
    images.update({ name: req.params.id }, { $pull: { shared: req.params.shared } }).then((i) => {
        console.log(i);
        res.location('/images/view/' + req.params.id + '/#addshared');
        res.redirect('/images/view/' + req.params.id + '/#addshared');
    });
});

router.post('/edit/:id/addtag/', isOwnerOrAdmin, [
    body('addtag', 'empty').trim().escape(),
    body('addtag', 'empty').not().isEmpty(),
], function(req, res, next) {
    // 
    const images = req.db.get('images');

    images.findOne({ name: req.params.id }).then((image) => {
        if (validationResult(req).isEmpty() && (req.body.addtag.trim() !== '') && (req.body.addtag.trim() !== '.') && (req.body.addtag.trim() !== '?')) {

            images.find({ name: req.params.id, tags: { $in: [req.body.addtag] } }).then((tag) => {
                if (tag.length === 0) {

                    images.update({ name: req.params.id }, { $push: { tags: req.body.addtag } }).then((image) => {
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
        };

    });
});

router.post('/edit/:id/addcollection', isOwnerOrAdmin, [
    body('addcollection', 'empty').trim().escape(),
    body('addcollection', 'empty').not().isEmpty(),
], function(req, res, next) {
    console.log('In add collection function');
    const images = req.db.get('images');
    const user = req.db.get('users');
    images.findOne({ name: req.params.id }).then((image) => {


        if (validationResult(req).isEmpty() && (req.body.addcollection.trim() !== '') && (req.body.addcollection.trim() !== '.') && (req.body.addcollection.trim() !== '?')) {
            images.find({ name: req.params.id, collections: { $in: [req.body.addcollection] } }).then((col) => {
                console.log('image found');
                console.log(col);
                if ((col.length === 0) || null) {
                    // if (col.include(req.body.addcollection)) {
                    user.update({ username: req.user.username }, { $push: { collections: req.body.addcollection } }).then(() => {

                        images.update({ name: req.params.id }, { $push: { collections: req.body.addcollection } }).then((image) => {
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
        };

    });
});

router.post('/edit/:id/addadmin/', isOwnerOrAdmin, [
    body('addadmin', 'empty').trim().escape(),
    body('addadmin', 'empty').not().isEmpty(),
], function(req, res, next) {
    console.log('addadmin started');
    const images = req.db.get('images');


    images.findOne({ name: req.params.id }).then((image) => {
        if (validationResult(req).isEmpty() && (req.body.addadmin.trim() !== '') && (req.body.addadmin.trim() !== '.') && (req.body.addadmin.trim() !== '?')) {

            images.find({ name: req.params.id, admins: { $in: [req.body.addadmin] } }).then((admin) => {
                if (admin.length === 0) {

                    images.update({ name: req.params.id }, { $push: { admins: req.body.addadmin } }).then((admin) => {
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
        };

    });
});
router.post('/edit/:id/addshared/', isOwnerOrAdmin, [
    body('addshared', 'empty').trim().escape(),
    body('addshared', 'empty').not().isEmpty(),
], function(req, res, next) {
    console.log('addshared started');
    const images = req.db.get('images');


    images.findOne({ name: req.params.id }).then((image) => {
        if (validationResult(req).isEmpty() && (req.body.addshared.trim() !== '') && (req.body.addshared.trim() !== '.') && (req.body.addshared.trim() !== '?')) {

            images.find({ name: req.params.id, shared: { $in: [req.body.addshared] } }).then((shared) => {
                if (shared.length === 0) {

                    images.update({ name: req.params.id }, { $push: { shared: req.body.addshared } }).then((shared) => {
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
        };

    });
});

router.post('/edit/:id/description/', isOwnerOrAdmin, [
    body('description', 'empty').trim().escape(),
    body('description', 'empty').not().isEmpty(),
], function(req, res, next) {

    const images = req.db.get('images');
    images.update({ name: req.params.id }, { $set: { description: req.body.description } }).then((image) => {
        res.location('/images/view/' + req.params.id + '/#description');
        res.redirect('/images/view/' + req.params.id + '/#description');
    });

});



router.post('/upload', isAuth, upload.single('upload-image'), (req, res, next) => {
    if (imageName != null) {
        let dirName = (__dirname + '').split('/');
        dirName.pop();
        let staticPath = '';
        dirName.forEach(folder => {
            staticPath += folder + '/';
        });


        //! Convert imageName upload/<Imagefile> to 300x300 and save in thumbnails/<ImageName>
        if (imageName.split('.').pop() !== '.gif') {
            fs.copyFile(staticPath + 'static/uploads/' + imageName,
                staticPath + 'static/thumbnails/' + imageName, (err) => {
                    console.log('Uplaod Error');
                });
        } else {
            sharp(staticPath + 'static/uploads/' + imageName)
                .resize(300, 300)
                .toFile(staticPath + 'static/thumbnails/' + imageName, (err, info) => {

                });
        }

        //
        const images = req.db.get('images');

        let name = imageName.split('.');
        name.pop();
        const imageLoc = '/uploads/' + imageName;
        const thumbnailLoc = '/thumbnails/' + imageName;
        const username = req.user.username;
        const description = '';
        const collections = [];
        const tags = [];
        const admins = [];
        const shared = [];
        const date = moment().toISOString();

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

router.post('/remove/:id/', isAuth, /*isOwner,*/ (req, res) => {

    const images = req.db.get('images');
    images.findOne({ name: req.params.id }).then((image) => {
        if (image['username'] + req.user.username) {
            images.remove({ name: req.params.id }).then(() => {
                let dirName = (__dirname + '').split('/');
                dirName.pop();
                let staticPath = '';
                dirName.forEach(folder => {
                    staticPath += folder + '/';
                });
                staticPath += 'static'
                    // image['thumbnail']
                    // image['location']

                try {
                    fs.unlinkSync(staticPath + image['thumbnail'])
                    fs.unlinkSync(staticPath + image['location'])
                } catch (error) {
                    console.log(`Delete error: ${error}`);
                }

                res.location('/users/myprofile');
                res.redirect('/users/myprofile');
            })
        }

    })
});


module.exports = router;