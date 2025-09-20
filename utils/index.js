const EC = require('elliptic').ec;
const hashOf = require('../utils/hashOf');

const ec = new EC('secp256k1');

const verifySignature = ({ publicKey, data, signature }) => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    return keyFromPublic.verify(hashOf(data), signature);
};

module.exports = { ec, verifySignature };