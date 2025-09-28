const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const path = require('path');
const cors = require('cors');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transactionPool');
const Wallet = require('./wallet/index');
const TransactionMiner = require('./app/transactionMiner');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({data: data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const {amount, recipient} = req.body;

    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

    try {
        if  (transaction){
            transaction.update({ senderWallet: wallet, amount, recipient });
        } else {
            transaction = wallet.createTransaction({amount, recipient, chain: blockchain.chain});
        }
    } catch (error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success', transaction});
});

app.get('/api/transactionPoolMap', (req, res) => {
    res.json(transactionPool.transactionMap);
})

app.get('/api/mineTransactions', (req, res) => {
    transactionMiner.mineTransactions();

    res.redirect('/api/blocks');
});

app.get('/api/walletInfo', (req, res) => {
    const address = wallet.publicKey;

    res.json({address, balance: Wallet.calculateBalance({ chain: blockchain.chain, address })});
});

app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('Replacing chain on a sync with:', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
};

const wallet2 = new Wallet();
const wallet3 = new Wallet();

const generateWalletTransaction = ({ recipient, amount }) => {
    const transaction = new Wallet().createTransaction({ recipient, amount, chain: blockchain.chain });

    transactionPool.setTransaction(transaction);
};

const walletAction = () => generateWalletTransaction({ wallet, recipient: wallet2.publicKey, amount: 10 });

const wallet2Action = () => generateWalletTransaction({ wallet: wallet2, recipient: wallet3.publicKey, amount: 5 });

const wallet3Action = () => generateWalletTransaction({ wallet: wallet3, recipient: wallet.publicKey, amount: 15 });

for (let i = 0; i < 10; i++) {
    if(i%3 === 0 ){
        walletAction();
        wallet2Action();
    } else if(i%3 === 2) {
        walletAction();
        wallet3Action();
    } else {
        wallet2Action();
        wallet3Action();
    }

    transactionMiner.mineTransactions();
}

let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`Listening on localhost: ${PORT}.`);
    if(PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});