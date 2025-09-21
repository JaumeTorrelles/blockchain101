const Wallet = require("./index");
const Transaction = require("./transaction");
const { verifySignature } = require('../utils');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a public key', () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'data'

        it('verifies a signatures', () => {
            expect(verifySignature({ publicKey: wallet.publicKey, data, signature: wallet.sign(data) })).toBe(true);
        });

        it('does not verify an invalid signature', () => {
            expect(verifySignature({ publicKey: wallet.publicKey, data , signature: new Wallet().sign(data) })).toBe(false);
        });

    });

    describe('createTransaction()', () => {
        describe('amount >> balance', () => {
            it('throws an error as the result', () => {
                expect(() => wallet.createTransaction({amount: 8374587203485702873045872, recipient: 'me'})).toThrow('amount exceeds balance');
            });
        });

        describe('amount <= balance', () => {
            let transaction, amount, recipient;
            beforeEach(() => {
                amount = 1000;
                recipient = 'the real recipient';
                transaction = wallet.createTransaction({amount, recipient});
            });

            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('matches transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });
    });
});