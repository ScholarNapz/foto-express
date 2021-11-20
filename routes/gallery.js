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
            images: images
        });
    });
});

router.post('/tags', isAuth, (req, res, next) => {

});


module.exports = router;