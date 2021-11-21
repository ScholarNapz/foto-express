const crypto = require('crypto');

// TODO
function genPassword(password) {
    let salt = crypto.randomBytes(32).toString('hex');
    let genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return {
        salt: salt,
        hash: genHash
    }

}

function validatePassword(password, hash, salt) {
    let hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return hash === hashPassword;
}

module.exports.validatePassword = validatePassword;
module.exports.genPassword = genPassword;