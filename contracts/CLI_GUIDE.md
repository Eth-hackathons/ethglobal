# Prediction Hub CLI Guide

A powerful command-line interface for local blockchain development and testing.

## Installation

The CLI is ready to use! No installation required.

```bash
# Make it executable (already done)
chmod +x cli.js

# Optional: Create an alias for easier access
echo "alias phub='node $(pwd)/cli.js'" >> ~/.zshrc
source ~/.zshrc

# Now you can use: phub <command>
```

## Quick Start

### 1. Start Local Blockchain

```bash
# Start Anvil
node cli.js run

# Or with npm
npm run anvil
```

### 2. Deploy Contracts (in another terminal)

```bash
node cli.js deploy
```

### 3. Complete Example Flow

```bash
# Register as a creator
node cli.js register "Alice"

# Create a market
node cli.js market "pm-123" "Will ETH reach $5k?" 7

# Get the market address from the output, then:
MARKET=0x... # Replace with actual address

# Stake from different accounts
node cli.js stake $MARKET 0 5 0    # Account 0 stakes 5 ETH on A
node cli.js stake $MARKET 1 3 1    # Account 1 stakes 3 ETH on B
node cli.js stake $MARKET 2 2 2    # Account 2 stakes 2 ETH on Draw

# Check status
node cli.js status $MARKET

# Trigger execution (as creator)
node cli.js trigger $MARKET 0      # Creator bets on A

# Settle market (simulate Polymarket return)
node cli.js settle $MARKET 0 15    # A wins, 15 ETH payout

# Claim rewards (only winner can claim)
node cli.js claim $MARKET 0        # Account 0 claims
```

## Command Reference

### Blockchain Commands

#### `run` - Start Anvil
```bash
node cli.js run
```
Starts a local Ethereum blockchain with:
- 10,000 ETH per account
- 10 pre-funded accounts
- Chain ID: 31337
- RPC: http://localhost:8545

#### `expose` - Expose via ngrok
```bash
node cli.js expose
```
Exposes your local Anvil to the internet using ngrok. Useful for:
- Testing with remote frontends
- Mobile app development
- Team collaboration

**Requires:** ngrok installed (`brew install ngrok` or visit ngrok.com)

#### `reset` - Reset Blockchain
```bash
node cli.js reset
```
Kills Anvil and clears deployment config. Start fresh.

#### `accounts` - List Accounts
```bash
node cli.js accounts
```
Shows all 10 Anvil test accounts with addresses and private keys.

#### `balance` - Check Balance
```bash
# Check specific address
node cli.js balance 0x123...

# Check all accounts
node cli.js balance
```

#### `fund` - Fund Wallet
```bash
node cli.js fund 0x123... 10
node cli.js fund 0x123... 5eth
```
Sends ETH from Account 0 to any address.

---

### Contract Commands

#### `deploy` - Deploy Contracts
```bash
node cli.js deploy
```
Deploys all contracts to Anvil:
- NetworkConfig
- MockPolymarket
- PredictionHub

Saves addresses to `.cli-config.json`.

#### `status` - Get Status
```bash
# Hub statistics
node cli.js status

# Specific market
node cli.js status 0xMarketAddress...
```
Shows:
- Total creators
- Total markets
- Total Value Locked
- Market pool info
- Market state

---

### Creator Commands

#### `register` - Register as Creator
```bash
node cli.js register "Your Name"
node cli.js register "Your Name" "ipfs://metadata-uri"
```
Registers Account 0 as a creator on the hub.

#### `market` - Create Market
```bash
node cli.js market "polymarket-id" "Description" 7
```
Creates a new prediction market:
- **polymarket-id**: ID from Polymarket
- **Description**: Market question
- **7**: Days until deadline (default: 7)

Returns the deployed market address.

---

### User Commands

#### `stake` - Stake on Outcome
```bash
node cli.js stake <market> <outcome> <amount> [account]
```

**Outcomes:**
- `0` = A
- `1` = B
- `2` = Draw

**Examples:**
```bash
# Account 0 stakes 5 ETH on outcome A
node cli.js stake 0xMarket... 0 5 0

# Account 1 stakes 2.5 ETH on outcome B
node cli.js stake 0xMarket... 1 2.5 1

# Account 2 stakes 1 ETH on Draw
node cli.js stake 0xMarket... 2 1 2
```

#### `claim` - Claim Rewards
```bash
node cli.js claim <market> [account]
```

Claims winnings after market settlement. Only winners can claim.

```bash
# Claim as account 0
node cli.js claim 0xMarket... 0

# Claim as account 1
node cli.js claim 0xMarket... 1
```

---

### Testing Commands

#### `trigger` - Trigger Execution
```bash
node cli.js trigger <market> <outcome>
```

Creator locks the market and selects betting outcome:
```bash
# Creator bets on outcome A
node cli.js trigger 0xMarket... 0
```

#### `settle` - Settle Market
```bash
node cli.js settle <market> <winning-outcome> <payout-eth>
```

Simulates Polymarket resolution:
```bash
# A wins with 10 ETH payout
node cli.js settle 0xMarket... 0 10

# Draw wins with 5 ETH payout
node cli.js settle 0xMarket... 2 5
```

---

## Advanced Usage

### Using with npm scripts

```bash
# Start Anvil
npm run anvil

# Deploy and setup
npm run dev:setup

# Use CLI
npm run cli -- deploy
npm run cli -- register "Alice"
npm run cli -- help
```

### Environment Variables

Create a `.env` file:
```bash
# Custom RPC URL
RPC_URL=http://localhost:8545

# Default account (0-9)
DEFAULT_ACCOUNT=0
```

### Config File

Deployed addresses are stored in `.cli-config.json`:
```json
{
  "networkConfig": "0x...",
  "mockPolymarket": "0x...",
  "predictionHub": "0x...",
  "deployedAt": "2024-..."
}
```

---

## Complete Test Scenario

Here's a full end-to-end test:

```bash
# Terminal 1: Start Anvil
node cli.js run

# Terminal 2: Setup and test
cd contracts

# Deploy
node cli.js deploy

# Register creator (Account 0)
node cli.js register "Alice" "ipfs://alice"

# Create a market (7 days from now)
node cli.js market "pm-soccer" "Who wins the match?" 7
# Save the market address: MARKET=0x...

# Check initial status
node cli.js status
node cli.js status $MARKET

# Users stake (simulate 3 different users)
node cli.js stake $MARKET 0 5 0    # Alice: 5 ETH on Team A
node cli.js stake $MARKET 1 3 1    # Bob: 3 ETH on Team B
node cli.js stake $MARKET 2 2 2    # Charlie: 2 ETH on Draw

# Check pool
node cli.js status $MARKET
# Should show: A=5, B=3, Draw=2 (total 10 ETH)

# Creator triggers (Alice bets on Team A)
node cli.js trigger $MARKET 0

# Check state
node cli.js status $MARKET
# State should be: MockTrading

# Settle: Team A wins with profit
node cli.js settle $MARKET 0 15    # 15 ETH payout (5 ETH profit)

# Winners claim (only Alice can claim, she staked on A)
node cli.js claim $MARKET 0
# Alice gets 15 ETH

# Bob and Charlie try to claim (should fail)
node cli.js claim $MARKET 1  # ❌ Can't claim (staked on B)
node cli.js claim $MARKET 2  # ❌ Can't claim (staked on Draw)

# Check final balances
node cli.js balance
```

---

## Troubleshooting

### "Anvil not running"
```bash
# Start Anvil in another terminal
node cli.js run
```

### "No deployed contracts"
```bash
# Deploy contracts
node cli.js deploy
```

### "Not a creator"
```bash
# Register first
node cli.js register "Your Name"
```

### "Can't claim"
You can only claim if:
1. Market is settled
2. You staked on the creator's chosen outcome
3. That outcome won
4. You haven't claimed already

### Reset everything
```bash
node cli.js reset
node cli.js run  # In another terminal
node cli.js deploy
```

---

## Tips & Tricks

### 1. Create bash aliases
```bash
# Add to ~/.zshrc or ~/.bashrc
alias phub='node /path/to/contracts/cli.js'
alias anvil-start='cd /path/to/contracts && node cli.js run'
```

### 2. Quick deploy script
```bash
# deploy-dev.sh
#!/bin/bash
node cli.js deploy
node cli.js register "Dev Account"
echo "Ready for development!"
```

### 3. Multiple markets
```bash
# Create several markets
for i in {1..5}; do
  node cli.js market "market-$i" "Test Market $i" 7
done
```

### 4. Fund external wallet
```bash
# Fund your MetaMask
node cli.js fund 0xYourMetaMaskAddress 100
```

### 5. Monitor in real-time
```bash
# Watch contract status
watch -n 2 'node cli.js status $MARKET'
```

---

## Next Steps

- Integrate with your frontend
- Add more CLI commands as needed
- Create automated test scripts
- Set up CI/CD with CLI commands

---

## Support

For issues or questions:
- Check the main README.md
- Review test files for usage examples
- Run `node cli.js help` for quick reference

