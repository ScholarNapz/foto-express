var express = require('express');
var router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


/* GET users listing. */
router.get('/', ensureAuthenticated,
    function(req, res, next) {
        res.render('user', { title: 'Express' });
    });

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