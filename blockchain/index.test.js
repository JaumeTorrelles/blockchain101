const Blockchain = require('./index')
const Block = require('./block');
const hashOf = require('../util/hashOf');


describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
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
                    const hash = hashOf(timestamp, lastHash, difficulty, nonce, data);
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

        let errorMock, logMock;

        beforeEach( () => {
            errorMock = jest.fn();
            logMock = jest.fn();
            
            global.console.error = errorMock;
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
    });
});