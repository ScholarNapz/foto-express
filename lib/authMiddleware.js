const alert = require('alert');

module.exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    } else {
        alert('Please Login Or Register To Use The App');
        res.redirect('/');
    }
}

module.exports.isAccountOwner = (req, res, next) => {
    console.log(req.user.username, req.params.username);
    if (req.isAuthenticated() && req.user.username === req.params.username) {
        next()
    } else {
        res.redirect('/');
    }
}

module.exports.isOwner = (req, res, next) => {
    console.log(req.user.username, req.params.username);
    if (req.isAuthenticated() && req.user.username === req.params.username) {
        next()
    } else {
        res.redirect('/');
    }

}