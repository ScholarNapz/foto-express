var express = require('express');
var router = express.Router();

var fs = require('fs');

//! to format date string
const moment = require('moment');
//! to get full path of of file- to rip extension
const path = require('path');

const sharp = require('sharp');



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
        cb(new Error('File is not in image format.'), false);
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
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/upload', function(req, res, next) {
    res.render('upload', { title: 'Express' });
});

router.post('/upload', upload.single('upload-image'), (req, res, next) => {
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
                if (err) throw err;
            });
    } else {
        sharp(staticPath + 'static/uploads/' + imageName)
            .resize(300, 300)
            .toFile(staticPath + 'static/thumbnails/' + imageName, (err, info) => {

            });
    }

    const db = require('monk')('localhost/fotodb');
    const images = db.get('images');

    const name = imageName;
    const imageLoc = '/uploads/' + imageName;
    const thumbnailLoc = '/thumbnails/' + imageName;
    const username = 'mario';
    const description = '';
    const collections = '';
    const tags = '';
    const date = moment().toISOString();

    images.insert({
        name: name,
        location: imageLoc,
        thumbnail: thumbnailLoc,
        username: username,
        description: description,
        collections: collections,
        tags: tags,
        date: date
    });

    res.location('/gallery');
    res.redirect('/gallery');
});


module.exports = router;