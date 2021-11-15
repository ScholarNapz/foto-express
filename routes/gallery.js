var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    const db = req.db;
    const images = db.get('images')

    images.find({}, { sort: { date: -1 } }).then((images) => {
        res.render('gallery', {
            title: 'Express',
            images: images
        });
    });
});


module.exports = router;