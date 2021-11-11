const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bcrypt = require('bcryptjs');

// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost/fotodb')
    .then(result => {
        console.log(result);
    }).catch(err => {
        console.log(err);
        throw err;
    });

const db = mongoose.connection;

//User Schema
const userSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    profileimage: {
        type: String
    },
    bio: {
        type: String
    }

});

const User = module.exports = mongoose.model('User', userSchema);

module.exports.createUser = (newUser, cb) => {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(cb);
        });
    });
};

module.exports.getUserById = (id, cb) => {
    User.findById(id, cb);
};

module.exports.getUserByUsername = (username, cb) => {
    const query = { username: username };
    User.findOne(query, cb);
};

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        callback(null, isMatch);
    });
};

// const mongodb = require('mongodb');
// const mongoClient = mongodb.mongoClient;

// const mongoConnect = callback => {
//     mongoClient.connect('mongodb://localhost/fotodb')
//         .then(result => {
//             console.log('Mongoose Connected');
//         }).catch(err => {
//             console.log(err);
//         })
// };

// module.export = mongoConnect;