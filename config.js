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

const REWARD_INPUT = { address: 'REWARD_TRANSACTION' }

const MINING_REWARD = 50;

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE, REWARD_INPUT, MINING_REWARD };