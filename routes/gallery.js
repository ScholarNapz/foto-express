var express = require('express');
var router = express.Router();
const passport = require('passport');

const isAuth = require('../lib/authMiddleware').isAuth;

/* GET home page. */
router.get('/', isAuth, function(req, res, next) {
    const images = req.db.get('images')
    console.log('123456123');
    console.log(req.user.username);
    images.find({}, { sort: { date: -1 } }).then((images) => {
        res.render('gallery', {
            title: 'Gallery',
            isCollection: false,
            username: req.user.username,
            images: images
        });
    });
});

router.post('/tags', isAuth, (req, res, next) => {
    res.location('./tags/' + req.body.search);
    res.redirect('./tags/' + req.body.search);
});

router.get('/tags/:id', isAuth, (req, res, next) => {
    const images = req.db.get('images');
    images.find({ tags: { $regex: ".*" + req.params.id + ".*" } }, { sort: { date: -1 } }).then((imgs) => {
        console.log(imgs);
        res.render('gallery', { title: 'Tags Search: ' + req.params.id, username: req.user.username, isCollection: false, images: imgs })
    })
});

router.get('/collection/:usr/:id', isAuth, (req, res, next) => {
    const images = req.db.get('images');
    images.find({ username: req.params.usr, collections: req.params.id }, { sort: { date: -1 } }).then((imgs) => {
        console.log(imgs);
        res.render('gallery', { title: req.params.usr + ': ' + req.params.id, isCollection: true, username: req.user.username, usr: req.params.usr, images: imgs })
    })
});


module.exports = router;