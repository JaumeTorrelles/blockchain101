const Blockchain = require('./index')
const Block = require('./block');
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");

describe('Blockchain', () => {
    let blockchain, newChain, originalChain, errorMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;

        errorMock = jest.fn();

        global.console.error = errorMock;
    })

    it('contains a `chain` array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('should start with the genesisBlock', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds new block to chain', () => {
        const newData = 'data';
        blockchain.addBlock( { data: newData } );

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    })

    describe('isValidChain()', () => {

        beforeEach(() => {
            blockchain.addBlock({data:'b1'});
            blockchain.addBlock({data:'b2'});
            blockchain.addBlock({data:'b3'});
        });

        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data: 'invalid' };

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain does start with the genesis block and has multiple blocks', () => {
            describe('last hash ref corrupted', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'notGood';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('the chain has block with invalid field', () => {
                it('reutrns false', () => {
                    blockchain.chain[2].data = 'notGood';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('chain contains block with jumped difficulty', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const maliciousBlock = new Block({timestamp, lastHash, difficulty, nonce, data});

                    blockchain.chain.push(maliciousBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('chain has no invalid blocks', () => {
                it('returns true' , () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {

        let logMock;

        beforeEach( () => {
            logMock = jest.fn();

            global.console.log = logMock;
        })

        describe('new chain is not longer that actual', () => {
            beforeEach(() => {
                newChain.chain[0] = { new: 'chain' };
                
                blockchain.replaceChain(newChain.chain);
            });

            it('doesnt get replaced', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs the error properly', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('new chain is longer that actual', () => {
            beforeEach(() => {
                newChain.addBlock({data:'b1'});
                newChain.addBlock({data:'b2'});
                newChain.addBlock({data:'b3'});
            });
            
            describe('chain is valid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'notGood'

                    blockchain.replaceChain(newChain.chain);
                });

                it('gets replaced', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs the error properly', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('chain is invalid', () => {
                
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                })
                
                it('doesnt get replaced', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('logs chain replace', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });

        describe('the `validateTransactions` flag is true', () => {
            it('calls valid transaction data', () => {
                const validateTransactionDataMock = jest.fn();

                blockchain.validTransactionData = validateTransactionDataMock;

                newChain.addBlock({data: 'whatever'});
                blockchain.replaceChain(newChain.chain, true);

                expect(validateTransactionDataMock).toHaveBeenCalled();
            })
        });
    });

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach( () => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({ recipient: 'rec1', amount: 100 });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });

        describe('the transaction data is valid', () => {
            it('returns true', () => {
                newChain.addBlock({data: [transaction, rewardTransaction]});

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
            });
        });

        describe('the transaction data has multiple rewards', () => {
            it('returns false and logs error', () => {
                newChain.addBlock({data: [transaction, rewardTransaction, rewardTransaction]});

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('the transaction data has at least one malformed outputMap', () => {
            describe('the transaction is not a reward transaction', () => {
                it('returns false and logs error', () => {
                    transaction.outputMap[wallet.publicKey] = 8450892793045;

                    newChain.addBlock({data: [transaction, rewardTransaction]});

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe('the transaction is a reward transaction', () => {
                it('returns false and logs error', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 8450892793045;

                    newChain.addBlock({data: [transaction, rewardTransaction]});

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe('the transaction data has at least one malformed input', () => {
            it('returns false and logs error', () => {
                wallet.balance = 10000;

                const maliciousOutputMap = { [wallet.publicKey]: 9000, recipient: 1000 };

                const maliciousTransaction = { input: {
                                                                            timestamp: Date.now(),
                                                                            amount:wallet.balance,
                                                                            address: wallet.publicKey,
                                                                            signature: wallet.sign(maliciousOutputMap) }, outputMap: maliciousOutputMap
                };

                newChain.addBlock({data: [maliciousTransaction, rewardTransaction]});

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('a block contains multiple identical transactions', () => {
            it('returns false and logs error', () => {
                newChain.addBlock({data: [transaction, transaction, transaction, rewardTransaction]});

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();

            });
        });
    });
});