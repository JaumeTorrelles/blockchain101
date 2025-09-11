const bodyParser = require('body-parser');
const express = require('express');
const Blockchain = require('./Blockchain');

const app = express();
const blockchain = new Blockchain();

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({data: data });

    res.redirect('/api/blocks');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}.`));