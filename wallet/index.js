const { STARTING_BALANCE } = require('../config');
const { ec, hashOf } = require('../utils');
const Transaction = require("./transaction");

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        return this.keyPair.sign(hashOf(data))
    }

    createTransaction({ amount, recipient }) {
        if (amount > this.balance) {
            throw new Error("amount exceeds balance");
        } else {
            return new Transaction({ senderWallet: this, recipient, amount });
        }
    }

}

module.exports = Wallet;