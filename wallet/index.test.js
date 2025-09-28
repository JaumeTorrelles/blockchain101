const Wallet = require("./index");
const Transaction = require("./transaction");
const { verifySignature } = require('../utils');
const Blockchain = require("../blockchain");
const {STARTING_BALANCE} = require("../config");

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

        describe('a chain is passed', () => {

            it('calls `Wallet.calculateBalance`', () => {
                const calculateBalanceMock = jest.fn();

                const originalCalculateBalance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({ amount: 100, recipient: 'rec1', chain: new Blockchain().chain });

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;
            });
        });
    });

    describe('calculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('there are no outputs for the wallet', () => {
            it('returns the starting `balance`', () => {
                expect(Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey })).toEqual(STARTING_BALANCE);
            });
        });

        describe('there are outputs for the wallet', () => {
            let transaction1, transaction2;
            beforeEach(() => {
                transaction1 = new Wallet().createTransaction({ amount: 100, recipient: wallet.publicKey });

                transaction2 = new Wallet().createTransaction({ amount: 200, recipient: wallet.publicKey });

                blockchain.addBlock({ data: [transaction1, transaction2] });
            });

            it('adds the sum of all outputs to the wallet balance', () => {
                expect(Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey })).toEqual(STARTING_BALANCE +
                                                                                                                            transaction1.outputMap[wallet.publicKey] +
                                                                                                                            transaction2.outputMap[wallet.publicKey]);
            });

            describe('and the wallet has made a transaction', () => {
                let recentTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({amount: 100, recipient: 'rec1'});

                    blockchain.addBlock({ data: [recentTransaction] });
                });

                it('returns the output amount of the recent transaction', () => {
                    expect(Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey })
                            ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
                });

                describe('and there are outputs next to and after the recent transaction', () => {
                    let sameBlockTransaction, nextBlockTransaction;

                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({amount: 100, recipient: 'rec2'});

                        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });

                        blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction] });

                        nextBlockTransaction = new Wallet().createTransaction({ amount: 200, recipient: wallet.publicKey });

                        blockchain.addBlock({ data: [nextBlockTransaction] });
                    });

                    it('includes the output amounts in the return balance', () => {
                        expect(Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})
                                ).toEqual(recentTransaction.outputMap[wallet.publicKey] +
                                                    sameBlockTransaction.outputMap[wallet.publicKey] +
                                                    nextBlockTransaction.outputMap[wallet.publicKey]);
                    });
                });
            });
        });
    });
});