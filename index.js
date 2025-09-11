const express = require('express');
const Blockchain = require('./Blockchain');

const app = express();
const blockchain = new Blockchain();

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}.`));