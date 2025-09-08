const MINE_RATE = 1000; //1000ms wich is 1sec
const INITIAL_DIFFICULTY = 1;


const GENESIS_DATA = {
    timestamp: 'one',
    lastHash: 'day',
    hash: 'or',
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY,
    data: ['day', 'one']
};

module.exports = { GENESIS_DATA, MINE_RATE }