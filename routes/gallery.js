var express = require('express');
var router = express.Router();
const passport = require('passport');

const isAuth = require('../lib/authMiddleware').isAuth;

const alert = require('alert');

const fs = require('fs');

function isOwner(req, res, next) {
    console.log(`username: ${req.user.username}`);
    console.log(`usr:      ${req.params.usr}`);


    if (req.user.username === req.params.usr) {
        next();
    } else {
        alert(`This Operation Is Reserved For The Owner Only`);
        res.render('/gallery', { title: 'Gallery', username: req.user.username, image: image });
    }
}

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
    let id = req.params.id;
    console.log(`Collection name:\n${id}`);
    images.find({ username: req.params.usr, collections: req.params.id }, { sort: { date: -1 } }).then((imgs) => {
        console.log(imgs);
        res.render('gallery', {
            title: req.params.id,
            isCollection: true,
            username: req.user.username,
            usr: req.params.usr,
            images: imgs
        })
    })
});

router.get('/remove/collection/:usr/:id/', isAuth, isOwner, (req, res) => {
    console.log(`===================\n${req.params.usr}\n-----------------\nDELETE COLLETION\n${req.params.id}===================`);
    const images = req.db.get('images');
    images.find({ username: req.user.username, collections: { $in: [req.params.id] } }).then((image) => {

        console.log(`user: ${req.user.username}`);
        console.log(`coll: ${req.params.id}`);
        console.log(image);
        let adminObj = {}


        const jsn = JSON.parse(JSON.stringify(image));
        var arr = [];
        arr = jsn;
        if (arr.length == 0) {
            console.log(`===================\n${req.params.usr}\n-----------------\nEMPTY COLLECTION\n${req.params.id}===================`);
        } else {
            let itemsDone = 0;
            arr.forEach(elm => {
                elm.location


                let dirName = (__dirname + '').split('/');
                dirName.pop();
                let staticPath = '';
                dirName.forEach(folder => {
                    staticPath += folder + '/';
                });
                staticPath += 'static'
                console.log(elm.location);
                console.log(elm.thumbnail);
                console.log(staticPath);
                // image['thumbnail']
                // image['location']

                try {
                    fs.unlinkSync(staticPath + elm.thumbnail)
                    fs.unlinkSync(staticPath + elm.location)
                } catch (error) {
                    console.log(`===================\nDelete error: ${error}\n===================`);
                }

                images.remove({ location: elm.location })

                itemsDone++;
                if (itemsDone === arr.length) {
                    alert('Image Is Removed');
                    res.location('/users/myprofile');
                    res.redirect('/users/myprofile');
                }



            });
        }





        // if (image['username'] + req.user.username) {
        //     images.remove({ name: req.params.id }).then(() => {

        //     })
        // }

    })
});


module.exports = router;