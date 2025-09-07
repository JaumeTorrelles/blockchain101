const Block = require("./block");
const { GENESIS_DATA } = require("./config");
const hashOf = require('./hashOf')


describe('Block', () => {
    const timestamp = 't-timestamp';
    const lastHash = 't-lastHash';
    const hash = 't-hash';
    const data = ['t-data1', 't-data2'];
    const block = new Block ({ timestamp, lastHash, hash, data});

    it('has a timestamp, lastHash, hash. and data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);

    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        console.log('genesisBlock', genesisBlock);

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
            expect(minedBlock.hash).toEqual(hashOf(minedBlock.timestamp, lastBlock.hash, data));
        });
    })
});