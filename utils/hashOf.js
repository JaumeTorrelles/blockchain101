const crypto = require('crypto');

const hashOf = (...allInputs) => {
    const hash = crypto.createHash('sha256');

    hash.update(allInputs.sort().join(' '));

    return hash.digest('hex');
};


module.exports = hashOf;