const Block = require('./block');
const hashOf = require('./hashOf');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock( { data } ) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);
    }

    static isValidChain( chain ) {
        //check genesis block
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;
        
        for (let i = 1; i < chain.length; i++) {
            const { timestamp, lastHash, hash, data } = chain[i];

            const validLastHash = chain[i-1].hash;
            if ( lastHash !== validLastHash ) return false;

            const validHash = hashOf(timestamp, lastHash, data);
            if (hash !== validHash) return false;
        }

        return true;
    }

    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error('Incoming chain not long enough!');
            return;
        }
        if(!Blockchain.isValidChain(chain)) {
            console.error('Incoming chain not valid!');
            return;
        }
        
        console.log('Old chain being replace for: ', chain);
        this.chain = chain;
    }
}

module.exports = Blockchain;