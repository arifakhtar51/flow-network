# Crowdfunding Platform on Plume Blockchain

Welcome to the Crowdfunding Platform built on the Plume blockchain! This project leverages the Plume testnet to enable users to create and fund campaigns securely and transparently.

## Features

- **Create Campaigns**: Users can create crowdfunding campaigns with a title, description, funding goal, and deadline.
- **Fund Campaigns**: Contributors can fund campaigns using TRX on the Tron blockchain.
- **View Campaigns**: All campaigns are publicly visible, with details such as funding status and time left.
- **Decentralized**: Built on the Tron blockchain to ensure transparency and immutability.

## Tech Stack

- **Blockchain**: Plume
- **Smart Contracts**: Solidity
- **Frontend**: React.js
- **Wallet Integration**: Metamask
- **Storage**: IPFS (if used for campaign assets)

## Installation and Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or above)
- [TronLink Wallet](https://www.tronlink.org/)
- [TronBox](https://developers.tron.network/docs/tronbox-overview) (for smart contract deployment)
- [Neil Testnet Faucet](https://nileex.io/) to obtain TRX for testing

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Deploy smart contracts to Plume testnet:
   -
   - Deploy contracts:
     ```bash
     tronbox migrate --network nile
     ```
   - Note the contract addresses for later use.


4. Start the development server:
   ```bash
   npm start
   ```

5. Open the application in your browser at `http://localhost:3000`.

## Usage

1. **Connect Wallet**: Install and connect the Plume wallet.
2. **Create a Campaign**: Provide the campaign details and submit the form. The campaign data is recorded on the Tron blockchain.
3. **Fund a Campaign**: Browse campaigns and contribute TRX.
4. **Track Progress**: View campaign statuses, including funds raised and deadlines.

#   s t o r y - b l o c k c h a i n  
 #   s t o r y - b l o c k c h a i n  
 #   f l o w - n e t w o r k  
 