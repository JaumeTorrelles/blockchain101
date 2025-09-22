const TransactionPool = require('./transactionPool')
const Transaction = require('./transaction');
const Wallet = require('./index');

describe('TransactionPool', () => {
   let transactionPool, transaction;

   beforeEach(async () => {
       transactionPool = new TransactionPool;
       transaction = new Transaction({
           senderWallet: new Wallet(),
           recipientWallet: 'rec',
           amount: 1000
       });
   });

   describe('setTransaction()', () => {
       it('adds a transaction', () => {
           transactionPool.setTransaction(transaction);

           expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
       });
   });
});