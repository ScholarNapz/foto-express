module.exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    } else {
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

    // req.db.get('images').findOne({ username: req.user.username }).then((image) => {
    //     if (image['username'] + req.user.username) {

    //     } else {

    //     }

    // })
}