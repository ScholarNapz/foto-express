const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./user');
const User = connection.models.users;
const validatePassword = require('../lib/passwordUtils').validatePassword;


require('dotenv').config();
// const db = require('monk')(process.env.DB_STRING);
// const user = db.get('users');


//? if you dont use username and password for login form name - you can set custom names 
const customField = {
    usernameField: 'username',
    passwordField: 'password'
}


const verifyCallback = (username, password, done) => {

        // const db = require('monk')(process.env.DB_STRING);
        // const user = db.get('users');

        // console.log(user);
        // console.log(username);

        User.findOne({ username: username })
            .then((user) => {
                // console.log('...');
                // console.log(user);
                if (!user) { return done(null, false) }

                const isValid = validatePassword(password, user.hash, user.salt);

                if (isValid) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            })
            .catch((err) => {
                done(err);
            });
    }
    // const strategy = new LocalStrategy(customField, verifyCallback);
const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    console.log(User);
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
        // const db = require('monk')(process.env.DB_STRING);
        // const user = db.get('users');
        // console.log('....123456789.........');
        // console.log(userId);
        // user.findOne({ _id: userID }).then((user) => {
        //         done(null, user);
        //     })
        //     .catch(err => done(err))
});