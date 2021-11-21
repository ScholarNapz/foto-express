const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

require('dotenv').config();

const conn = process.env.DB_STRING;
const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


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
    salt: {
        type: String
    },
    hash: {
        type: String
    },
    profileimage: {
        type: String
    },
    bio: {
        type: String
    },

}, { collection: 'users' });

const User = connection.model('users', userSchema);

// module.exports.getUserById = (id, cb) => {
//     User.findById(id, cb);
// };

// module.exports.getUserByUsername = (username, cb) => {
//     const query = { username: username };
//     User.findOne(query, cb);
// };

// module.exports.comparePassword = (candidatePassword, hash, callback) => {
//     bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
//         callback(null, isMatch);
//     });
// };

module.exports = connection;

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