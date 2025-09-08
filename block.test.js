const hexToBinary = require('hex-to-binary');

const Block = require("./block");
const { GENESIS_DATA, MINE_RATE } = require("./config");
const hashOf = require('./hashOf')


describe('Block', () => {
    const timestamp = 33;
    const lastHash = 't-lastHash';
    const hash = 't-hash';
    const data = ['t-data1', 't-data2'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block ({ timestamp, lastHash, hash, data, nonce, difficulty });



    it('has a timestamp, lastHash, hash. and data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = '';
        const minedBlock = Block.mineBlock( { lastBlock, data } );

        it('returns a new block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash` to be the `hash` of the lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates a sha256 `hash` based on given inputs', () => {
            expect(minedBlock.hash).toEqual(hashOf(minedBlock.timestamp, minedBlock.nonce, minedBlock.difficulty, lastBlock.hash, data));
        });

        it('sets a `hash` that meets the difficulty', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjusts diff', () => {
            const possibleResults = [lastBlock.difficulty+1, lastBlock.difficulty-1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        })
    });

    describe('adjustDifficulty()', () => {
        it('raises diff for early block', () => {
            expect(Block.adjustDifficulty({ originalBlock : block, timestamp: block.timestamp + MINE_RATE - 1 })).toEqual( block.difficulty + 1 );
        });

        it('lowers diff for late block', () => {
            expect(Block.adjustDifficulty({ originalBlock : block, timestamp: block.timestamp + MINE_RATE + 1 })).toEqual( block.difficulty - 1 );
        });

        it('has lower limit to 1', () => {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({ originalBlock : block })).toEqual(1);
        })
    });
});