const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require("../config");
const { hashOf } = require('../utils');

class Block {
    constructor( { timestamp, lastHash, hash, data, nonce, difficulty } ){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis(){
        return new this(GENESIS_DATA);
    };

    static mineBlock( { lastBlock, data } ){
        const lastHash = lastBlock.hash;
        let solution, timestamp;
        let nonce = 0;
        let { difficulty } = lastBlock;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
            solution = hashOf(timestamp, lastHash, nonce, difficulty, data)
        } while (hexToBinary(solution).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this( { timestamp, lastHash, data, nonce, difficulty, hash: solution });
    };

    static adjustDifficulty({ originalBlock, timestamp }){
        const { difficulty } = originalBlock;

        if (difficulty < 1) return 1;

        if ( (timestamp - originalBlock.timestamp) > MINE_RATE ) return difficulty - 1;

        return difficulty + 1;
    }
}

module.exports = Block;