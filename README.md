# Blockchain101

Another blockchain project? Groundbreaking.

A simple blockchain and cryptocurrency implementation built with Node.js and React.

## What it does

- **Blockchain**: Custom Proof-of-Work algorithm with dynamic difficulty
- **Cryptocurrency**: Digital wallet with ECDSA signatures
- **P2P Network**: Multiple nodes can connect and sync
- **Web Interface**: React app to interact with the blockchain

## Tech Stack

- **Backend**: Node.js, Express, Redis
- **Frontend**: React, Bootstrap
- **Crypto**: Elliptic (ECDSA)
- **Testing**: Jest

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Redis** (for P2P features)
   ```bash
   redis-server
   ```

3. **Run the app**
   ```bash
   npm run dev
   ```

## Features

- Mine blocks and create transactions
- View blockchain data in real-time
- Connect multiple nodes to test P2P
- Digital wallet with balance tracking
- Comprehensive test suite

## API

- `GET /api/blocks` - View entire blockchain
- `GET /api/blocks/:id` - Get paginated blocks (5 per page)
- `POST /api/mine` - Mine a new block with custom data
- `POST /api/transact` - Create a new transaction
- `GET /api/transactionPoolMap` - Get pending transactions
- `GET /api/mineTransactions` - Mine pending transactions
- `GET /api/blocksLength` - Get blockchain length
- `GET /api/knownAddresses` - Get all known wallet addresses
- `GET /api/walletInfo` - Get wallet address and balance

## Testing

```bash
npm test
```

## Project Structure

```
├── blockchain/         # Core blockchain logic
├── wallet/             # Cryptocurrency wallet
├── client/             # React frontend
│   └── src/            # Source code
│       ├── assets/     # Static assets
│       └── components/ # React components
├── app/                # P2P networking
├── utils/              # Helper functions
```

Built for learning blockchain fundamentals + JavaScript and ReactJS basics.
