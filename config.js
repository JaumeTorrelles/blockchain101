const MINE_RATE = 1000; //1000ms which is 1sec
const INITIAL_DIFFICULTY = 1;


const GENESIS_DATA = {
    timestamp: 'one',
    lastHash: 'day',
    hash: 'or',
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY,
    data: ['day', 'one']
};

const STARTING_BALANCE = 1000;

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE };