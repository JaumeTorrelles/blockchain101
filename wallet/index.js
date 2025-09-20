const { STARTING_BALANCE } = require('../config');
const { ec } = require('../utils');
const hashOf = require('../utils/hashOf');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        return this.keyPair.sign(hashOf(data))
    }

}

module.exports = Wallet;