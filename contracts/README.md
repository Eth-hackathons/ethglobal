# Prediction Hub Smart Contracts

A creator-driven prediction market platform built on Solidity using Foundry. Creators can import markets from Polymarket, allow their community to stake on outcomes, and distribute winnings proportionally.

## 🏗️ Architecture

### Core Contracts

1. **PredictionHub.sol** - Factory contract for creator registration and market deployment
2. **Market.sol** - Individual prediction market with 3-outcome support (A, B, Draw)
3. **MockPolymarket.sol** - Testing oracle that simulates Polymarket resolution
4. **NetworkConfig.sol** - Multi-chain configuration for easy deployment across networks

## 🚀 Features

- ✅ Creator registration and profile management
- ✅ Market creation with Polymarket import
- ✅ Three-outcome betting (A, B, Draw) for handling draws
- ✅ Mock cross-chain bridging simulation
- ✅ Proportional reward distribution to winners
- ✅ Comprehensive test coverage
- ✅ Multi-chain configuration (Anvil, Chiliz Testnet, Chiliz Mainnet)

## 📋 Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## 🛠️ Installation

```bash
# Clone the repository
cd contracts

# Install dependencies
forge install

# Build contracts
forge build

# Extract ABIs for frontend integration
node script/extractABI.js
# or
npm run extract-abi
```

## 📦 ABI Extraction

After building, extract ABIs for frontend integration:

```bash
# Using Node.js (recommended)
node script/extractABI.js

# Or using npm
npm run extract-abi

# Or using bash (requires jq)
./script/ExtractABI.sh
```

This creates an `ABI/` folder containing:
- Contract ABIs (JSON format)
- Contract bytecode files
- TypeScript type definitions
- Deployment template
- Network configuration

See `ABI/README.md` for frontend integration examples with ethers.js, wagmi, and viem.

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
forge test

# Run with verbose output
forge test -vvv

# Run specific test file
forge test --match-path test/Market.t.sol

# Run specific test function
forge test --match-test testStakeOutcomeA

# Run with gas reporting
forge test --gas-report

# Run with coverage
forge coverage
```

## 📦 Deployment

### Local Deployment (Anvil)

```bash
# Terminal 1: Start local Anvil node
anvil

# Terminal 2: Deploy contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast --private-key <PRIVATE_KEY>
```

### Chiliz Spicy Testnet Deployment

```bash
# Set environment variable
export PRIVATE_KEY=<your-private-key>

# Deploy to Chiliz Spicy testnet
forge script script/Deploy.s.sol \
  --rpc-url https://spicy-rpc.chiliz.com \
  --broadcast \
  --verify
```

### Chiliz Mainnet Deployment

```bash
# Deploy to Chiliz mainnet
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.chiliz.com \
  --broadcast \
  --verify \
  --etherscan-api-key <CHILIZ_API_KEY>
```

## 📖 Usage Guide

### 1. Register as a Creator

```solidity
// Register on PredictionHub
hub.registerCreator("My Creator Name", "ipfs://my-profile-metadata");
```

### 2. Create a Market

```solidity
// Create a prediction market
uint256 stakingDeadline = block.timestamp + 7 days;
address marketAddress = hub.createMarket(
    "polymarket-market-id",
    "Will ETH reach $5000 by year end?",
    stakingDeadline
);
```

### 3. Users Stake on Outcomes

```solidity
Market market = Market(marketAddress);

// Stake on outcome A
market.stake{value: 1 ether}(Market.Outcome.A);

// Stake on outcome B
market.stake{value: 2 ether}(Market.Outcome.B);

// Stake on Draw
market.stake{value: 0.5 ether}(Market.Outcome.Draw);
```

### 4. Creator Triggers Execution

```solidity
// Creator chooses which outcome to bet on
market.triggerExecution(Market.Outcome.A);
```

### 5. Mock Market Resolution

```solidity
// Simulate Polymarket returning funds
// In production, this will be done by Chainlink CRE
uint256 payout = 10 ether;
market.mockPolymarketReturn{value: payout}(
    Market.Outcome.A,  // winning outcome
    payout
);
```

### 6. Winners Claim Rewards

```solidity
// Only users who staked on the creator's choice AND it won can claim
market.claim();
```

## 📊 Contract Interfaces

### PredictionHub Key Functions

```solidity
// Creator management
function registerCreator(string memory name, string memory metadataURI) external
function updateCreatorMetadata(string memory newMetadataURI) external
function getCreatorProfile(address creator) external view returns (...)

// Market management
function createMarket(string memory polymarketId, string memory metadata, uint256 stakingDeadline) external returns (address)
function getCreatorMarkets(address creator) external view returns (address[] memory)
function getAllMarkets() external view returns (address[] memory)
function getActiveMarkets() external view returns (address[] memory)

// Statistics
function getHubStats() external view returns (uint256 totalCreators, uint256 totalMarkets, uint256 tvl)
function getTotalValueLocked() external view returns (uint256)
```

### Market Key Functions

```solidity
// Staking
function stake(Outcome outcome) external payable
function getStake(address user, Outcome outcome) external view returns (uint256)
function getPoolInfo() external view returns (uint256 totalA, uint256 totalB, uint256 totalDraw)

// Execution
function triggerExecution(Outcome outcome) external // onlyCreator
function mockPolymarketReturn(Outcome winningOutcome, uint256 payout) external

// Claims
function claim() external
function canClaim(address user) external view returns (bool)
function getPotentialReward(address user) external view returns (uint256)

// State
function getMarketSummary() external view returns (...)
```

## 🔍 Example Flow

```solidity
// 1. Creator registers
hub.registerCreator("SportsBettor", "ipfs://...");

// 2. Creator creates market
address marketAddr = hub.createMarket("polymarket-123", "Who wins the match?", block.timestamp + 3 days);
Market market = Market(marketAddr);

// 3. Users stake
// User1 stakes 2 ETH on Team A
market.stake{value: 2 ether}(Market.Outcome.A);
// User2 stakes 3 ETH on Team B
market.stake{value: 3 ether}(Market.Outcome.B);
// User3 stakes 1 ETH on Draw
market.stake{value: 1 ether}(Market.Outcome.Draw);

// 4. Creator triggers with their choice
market.triggerExecution(Market.Outcome.A); // Creator bets on Team A

// 5. Market resolves (simulated)
// Team A wins, returns 10 ETH profit
market.mockPolymarketReturn{value: 10 ether}(Market.Outcome.A, 10 ether);

// 6. User1 claims (they staked on A, and A won)
market.claim(); // Gets 10 ETH (they were the only one on winning side)

// User2 and User3 cannot claim (they didn't stake on A)
```

## 🧩 Project Structure

```
contracts/
├── src/
│   ├── PredictionHub.sol      # Factory contract
│   ├── Market.sol              # Individual market contract
│   ├── MockPolymarket.sol      # Testing oracle
│   └── NetworkConfig.sol       # Multi-chain config
├── test/
│   ├── PredictionHub.t.sol     # Hub tests
│   └── Market.t.sol            # Market tests
├── script/
│   └── Deploy.s.sol            # Deployment script
├── lib/                        # Dependencies
└── foundry.toml               # Foundry config
```

## 🔐 Security Considerations

- ✅ Only creators can trigger execution on their markets
- ✅ Only users who staked on the winning outcome (and creator's choice) can claim
- ✅ Double-claim protection
- ✅ State machine prevents invalid transitions
- ⚠️ MockPolymarket is for testing only - production will use Chainlink CRE
- ⚠️ No actual bridging in MVP - simulated with state changes

## 🚧 Future Enhancements (Not in MVP)

- [ ] Real Hyperlane cross-chain bridging
- [ ] Chainlink CRE automation for workflow orchestration
- [ ] Real Polymarket CLOB integration
- [ ] Creator fee mechanism
- [ ] Platform fee treasury
- [ ] Emergency pause functionality
- [ ] Time-weighted staking bonuses
- [ ] Creator reputation system

## 📝 Network Configuration

The contracts support multiple networks out of the box:

| Network | Chain ID | Configuration |
|---------|----------|---------------|
| Anvil (Local) | 31337 | Default testing config |
| Chiliz Spicy Testnet | 88882 | Testnet config |
| Chiliz Mainnet | 88888 | Production config |

To switch networks, simply deploy to the target RPC URL - `NetworkConfig` automatically adjusts based on `block.chainid`.

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean and rebuild
forge clean
forge build
```

### Test Failures

```bash
# Run tests with maximum verbosity to see detailed errors
forge test -vvvv
```

### Deployment Issues

```bash
# Verify RPC is accessible
curl -X POST <RPC_URL> -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check private key has funds
cast balance <YOUR_ADDRESS> --rpc-url <RPC_URL>
```

## 📄 License

MIT

## 🤝 Contributing

This is an MVP implementation. Contributions welcome for production features!

---

**Built with ❤️ using Foundry**
