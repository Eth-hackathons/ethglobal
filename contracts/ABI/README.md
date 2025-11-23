# Contract ABIs

This directory contains the extracted ABIs and metadata for frontend integration.

## Files

### Contract ABIs (JSON)
- **`NetworkConfig.json`** - Multi-chain configuration contract ABI
- **`MockPolymarket.json`** - Mock oracle for testing market resolution ABI
- **`Market.json`** - Individual prediction market contract ABI
- **`PredictionHub.json`** - Factory contract for creators and markets ABI

### Bytecode Files
- **`*.bytecode.json`** - Contract bytecode for deployment (if needed)

### Metadata Files
- **`contracts.json`** - Summary of all contracts with descriptions and network info
- **`contracts.d.ts`** - TypeScript type definitions for contract integration
- **`deployment.template.json`** - Template for storing deployment addresses

## Usage

### Frontend Integration (JavaScript/TypeScript)

```javascript
// Import ABIs
import PredictionHubABI from './ABI/PredictionHub.json';
import MarketABI from './ABI/Market.json';
import NetworkConfigABI from './ABI/NetworkConfig.json';

// With ethers.js
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Connect to PredictionHub
const hubAddress = '0x...'; // Your deployed address
const hub = new ethers.Contract(hubAddress, PredictionHubABI, signer);

// Register as creator
await hub.registerCreator("My Name", "ipfs://metadata");

// Create a market
const tx = await hub.createMarket(
  "polymarket-123",
  "Will ETH hit $5k?",
  Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now
);
```

### With wagmi (React)

```typescript
import { useContract, useContractWrite } from 'wagmi';
import PredictionHubABI from './ABI/PredictionHub.json';

function CreateMarketButton() {
  const { write } = useContractWrite({
    address: '0x...',
    abi: PredictionHubABI,
    functionName: 'createMarket',
  });

  const createMarket = () => {
    write({
      args: [
        'polymarket-123',
        'Market description',
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
      ]
    });
  };

  return <button onClick={createMarket}>Create Market</button>;
}
```

### With viem

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { chilizSpicy } from 'viem/chains';
import PredictionHubABI from './ABI/PredictionHub.json';

const publicClient = createPublicClient({
  chain: chilizSpicy,
  transport: http()
});

const walletClient = createWalletClient({
  chain: chilizSpicy,
  transport: http()
});

// Read from contract
const markets = await publicClient.readContract({
  address: '0x...',
  abi: PredictionHubABI,
  functionName: 'getAllMarkets'
});

// Write to contract
const { request } = await publicClient.simulateContract({
  address: '0x...',
  abi: PredictionHubABI,
  functionName: 'registerCreator',
  args: ['My Name', 'ipfs://metadata']
});
await walletClient.writeContract(request);
```

## Network Information

### Supported Networks

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Anvil (Local) | 31337 | http://localhost:8545 |
| Chiliz Spicy Testnet | 88882 | https://spicy-rpc.chiliz.com |
| Chiliz Mainnet | 88888 | https://rpc.chiliz.com |

## Deployment Addresses

After deploying, create a `deployment.json` file (copy from `deployment.template.json`):

```json
{
  "network": "chiliz_testnet",
  "chainId": 88882,
  "deployedAt": "2024-01-01T00:00:00Z",
  "deployer": "0x...",
  "contracts": {
    "NetworkConfig": "0x...",
    "MockPolymarket": "0x...",
    "Market": "0x...",
    "PredictionHub": "0x..."
  }
}
```

## Regenerating ABIs

If contracts are updated:

```bash
# Build contracts
forge build

# Extract ABIs using Node.js
node script/extractABI.js

# Or using npm
npm run extract-abi

# Or using bash (requires jq)
./script/ExtractABI.sh
```

## Key Contract Functions

### PredictionHub
- `registerCreator(name, metadataURI)` - Register as a creator
- `createMarket(polymarketId, metadata, deadline)` - Create a new market
- `getCreatorMarkets(creator)` - Get markets for a creator
- `getAllMarkets()` - Get all markets
- `getActiveMarkets()` - Get active markets
- `getHubStats()` - Get platform statistics

### Market
- `stake(outcome)` payable - Stake on an outcome (A=0, B=1, Draw=2)
- `triggerExecution(outcome)` - Creator triggers market (onlyCreator)
- `claim()` - Claim winnings after settlement
- `getStake(user, outcome)` - Get user's stake
- `getPoolInfo()` - Get total stakes for all outcomes
- `canClaim(user)` - Check if user can claim
- `getPotentialReward(user)` - Get potential reward amount

### NetworkConfig
- `getActiveConfig()` - Get config for current chain
- `getChainName()` - Get human-readable chain name
- `isTestnet()` - Check if current chain is testnet

## Events

### PredictionHub Events
- `CreatorRegistered(address creator, string name, uint256 timestamp)`
- `MarketCreated(address marketAddress, address creator, string polymarketId, uint256 stakingDeadline, uint256 timestamp)`

### Market Events
- `Staked(address user, Outcome outcome, uint256 amount)`
- `ExecutionTriggered(address creator, Outcome chosenOutcome, uint256 totalPool)`
- `MarketSettled(Outcome winningOutcome, uint256 totalPayout)`
- `Claimed(address user, uint256 amount)`
- `MarketCompleted()`

## License

MIT

