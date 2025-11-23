# Cast Command Cheat Sheet - Prediction Hub

Complete reference for interacting with Prediction Hub contracts using Foundry's `cast` CLI tool.

## Table of Contents
- [Setup & Configuration](#setup--configuration)
- [Account Management](#account-management)
- [Contract Deployment](#contract-deployment)
- [Reading Contract Data](#reading-contract-data)
- [Writing to Contracts](#writing-to-contracts)
- [PredictionHub Commands](#predictionhub-commands)
- [Market Commands](#market-commands)
- [Network & Chain Info](#network--chain-info)
- [Gas & Transactions](#gas--transactions)
- [Events & Logs](#events--logs)
- [Utilities](#utilities)

---

## Setup & Configuration

### Environment Variables
```bash
# Set RPC URLs
export ANVIL_RPC=http://localhost:8545
export CHILIZ_TESTNET_RPC=https://spicy-rpc.chiliz.com
export CHILIZ_MAINNET_RPC=https://rpc.chiliz.com

# Set private key (NEVER commit this!)
export PRIVATE_KEY=0xYourPrivateKeyHere

# Set contract addresses after deployment
export HUB_ADDRESS=0x...
export MARKET_ADDRESS=0x...
export NETWORK_CONFIG_ADDRESS=0x...
export MOCK_POLYMARKET_ADDRESS=0x...
```

### Quick RPC Selection
```bash
# Local
RPC=$ANVIL_RPC

# Testnet
RPC=$CHILIZ_TESTNET_RPC

# Mainnet
RPC=$CHILIZ_MAINNET_RPC
```

---

## Account Management

### Check Balance
```bash
# Check balance of an address
cast balance 0xYourAddress --rpc-url $RPC

# Check your own balance
cast balance $(cast wallet address --private-key $PRIVATE_KEY) --rpc-url $RPC

# With human-readable format
cast balance 0xYourAddress --rpc-url $RPC | cast to-unit ether
```

### Get Address from Private Key
```bash
cast wallet address --private-key $PRIVATE_KEY
```

### Generate New Wallet
```bash
cast wallet new
```

### Sign Message
```bash
cast wallet sign "Your message here" --private-key $PRIVATE_KEY
```

---

## Contract Deployment

### Deploy NetworkConfig
```bash
cast send --private-key $PRIVATE_KEY \
  --rpc-url $RPC \
  --create $(cat out/NetworkConfig.sol/NetworkConfig.json | jq -r .bytecode.object)
```

### Deploy PredictionHub
```bash
# First deploy NetworkConfig, then:
NETWORK_CONFIG_ADDRESS=0x...

cast send --private-key $PRIVATE_KEY \
  --rpc-url $RPC \
  --create $(cat out/PredictionHub.sol/PredictionHub.json | jq -r .bytecode.object) \
  --constructor-args $NETWORK_CONFIG_ADDRESS
```

### Using Forge Script (Recommended)
```bash
forge script script/Deploy.s.sol \
  --rpc-url $RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

---

## Reading Contract Data

### Basic Read Operations
```bash
# Call a view function
cast call $CONTRACT_ADDRESS "functionName()" --rpc-url $RPC

# Call with arguments
cast call $CONTRACT_ADDRESS "functionName(uint256)" 123 --rpc-url $RPC

# Call with address argument
cast call $CONTRACT_ADDRESS "functionName(address)" 0xAddress --rpc-url $RPC

# Decode the result
cast call $CONTRACT_ADDRESS "functionName()" --rpc-url $RPC | cast to-dec

# Multiple return values
cast call $CONTRACT_ADDRESS "getPoolInfo()" --rpc-url $RPC
```

### Get Contract Code
```bash
# Check if contract is deployed
cast code $CONTRACT_ADDRESS --rpc-url $RPC

# Get contract code size
cast code $CONTRACT_ADDRESS --rpc-url $RPC | wc -c
```

### Get Storage Slot
```bash
# Read storage at specific slot
cast storage $CONTRACT_ADDRESS 0 --rpc-url $RPC
```

---

## Writing to Contracts

### Basic Transaction (Send)
```bash
# Simple transaction
cast send $CONTRACT_ADDRESS \
  "functionName()" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC

# With arguments
cast send $CONTRACT_ADDRESS \
  "functionName(uint256,address)" \
  123 0xAddress \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC

# With ETH value
cast send $CONTRACT_ADDRESS \
  "functionName()" \
  --value 1ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC

# With gas limit
cast send $CONTRACT_ADDRESS \
  "functionName()" \
  --gas-limit 300000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC
```

### Wait for Confirmation
```bash
# Send and wait for receipt
TX_HASH=$(cast send $CONTRACT_ADDRESS "functionName()" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC \
  --json | jq -r .transactionHash)

cast receipt $TX_HASH --rpc-url $RPC
```

---

## PredictionHub Commands

### Register as Creator
```bash
cast send $HUB_ADDRESS \
  "registerCreator(string,string)" \
  "My Creator Name" "ipfs://my-metadata-uri" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC
```

### Create Market
```bash
# Calculate deadline (7 days from now)
DEADLINE=$(($(date +%s) + 604800))

cast send $HUB_ADDRESS \
  "createMarket(string,string,uint256)" \
  "polymarket-123" \
  "Will ETH reach $5000?" \
  $DEADLINE \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC
```

### Query Creator Info
```bash
# Check if address is a creator
cast call $HUB_ADDRESS \
  "isCreator(address)" \
  0xCreatorAddress \
  --rpc-url $RPC

# Get creator profile
cast call $HUB_ADDRESS \
  "getCreatorProfile(address)" \
  0xCreatorAddress \
  --rpc-url $RPC

# Get all creators
cast call $HUB_ADDRESS \
  "getAllCreators()(address[])" \
  --rpc-url $RPC
```

### Query Markets
```bash
# Get all markets
cast call $HUB_ADDRESS \
  "getAllMarkets()(address[])" \
  --rpc-url $RPC

# Get active markets
cast call $HUB_ADDRESS \
  "getActiveMarkets()(address[])" \
  --rpc-url $RPC

# Get markets for a creator
cast call $HUB_ADDRESS \
  "getCreatorMarkets(address)(address[])" \
  0xCreatorAddress \
  --rpc-url $RPC

# Get market count
cast call $HUB_ADDRESS \
  "marketCount()(uint256)" \
  --rpc-url $RPC
```

### Platform Statistics
```bash
# Get hub stats (total creators, markets, TVL)
cast call $HUB_ADDRESS \
  "getHubStats()(uint256,uint256,uint256)" \
  --rpc-url $RPC

# Get TVL
cast call $HUB_ADDRESS \
  "getTotalValueLocked()(uint256)" \
  --rpc-url $RPC | cast to-unit ether

# Get total creators
cast call $HUB_ADDRESS \
  "getAllCreators()(address[])" \
  --rpc-url $RPC | jq -r 'length'
```

### Update Creator Metadata
```bash
cast send $HUB_ADDRESS \
  "updateCreatorMetadata(string)" \
  "ipfs://new-metadata-uri" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC
```

---

## Market Commands

### Stake on Outcome
```bash
# Stake on Outcome A (0)
cast send $MARKET_ADDRESS \
  "stake(uint8)" \
  0 \
  --value 1ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC

# Stake on Outcome B (1)
cast send $MARKET_ADDRESS \
  "stake(uint8)" \
  1 \
  --value 2ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC

# Stake on Draw (2)
cast send $MARKET_ADDRESS \
  "stake(uint8)" \
  2 \
  --value 0.5ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC
```

### Trigger Execution (Creator Only)
```bash
# Creator chooses Outcome A
cast send $MARKET_ADDRESS \
  "triggerExecution(uint8)" \
  0 \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC

# Creator chooses Draw
cast send $MARKET_ADDRESS \
  "triggerExecution(uint8)" \
  2 \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC
```

### Query Market State
```bash
# Get market state
cast call $MARKET_ADDRESS \
  "state()(uint8)" \
  --rpc-url $RPC
# 0=Open, 1=Locked, 2=MockBridged, 3=MockTrading, 4=Settled, 5=Completed

# Get pool info
cast call $MARKET_ADDRESS \
  "getPoolInfo()(uint256,uint256,uint256)" \
  --rpc-url $RPC

# Get total pool
cast call $MARKET_ADDRESS \
  "getTotalPool()(uint256)" \
  --rpc-url $RPC | cast to-unit ether

# Check if settled
cast call $MARKET_ADDRESS \
  "isSettled()(bool)" \
  --rpc-url $RPC

# Check if outcome chosen
cast call $MARKET_ADDRESS \
  "outcomeChosen()(bool)" \
  --rpc-url $RPC

# Get chosen outcome
cast call $MARKET_ADDRESS \
  "chosenOutcome()(uint8)" \
  --rpc-url $RPC

# Get winning outcome
cast call $MARKET_ADDRESS \
  "winningOutcome()(uint8)" \
  --rpc-url $RPC
```

### Query User Stakes
```bash
# Get user's stake on Outcome A
cast call $MARKET_ADDRESS \
  "getStake(address,uint8)(uint256)" \
  0xUserAddress 0 \
  --rpc-url $RPC | cast to-unit ether

# Check if user can claim
cast call $MARKET_ADDRESS \
  "canClaim(address)(bool)" \
  0xUserAddress \
  --rpc-url $RPC

# Get potential reward
cast call $MARKET_ADDRESS \
  "getPotentialReward(address)(uint256)" \
  0xUserAddress \
  --rpc-url $RPC | cast to-unit ether

# Check if user has claimed
cast call $MARKET_ADDRESS \
  "hasClaimed(address)(bool)" \
  0xUserAddress \
  --rpc-url $RPC
```

### Get Market Summary
```bash
cast call $MARKET_ADDRESS \
  "getMarketSummary()(uint8,uint256,uint256,uint256,uint256,bool,uint8,bool,uint8)" \
  --rpc-url $RPC
```

### Claim Rewards
```bash
cast send $MARKET_ADDRESS \
  "claim()" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC
```

### Mock Polymarket Return (Testing)
```bash
# Simulate market resolution with payout
cast send $MARKET_ADDRESS \
  "mockPolymarketReturn(uint8,uint256)" \
  0 10000000000000000000 \
  --value 10ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC
```

### Query Market Details
```bash
# Get creator
cast call $MARKET_ADDRESS \
  "creator()(address)" \
  --rpc-url $RPC

# Get polymarket ID
cast call $MARKET_ADDRESS \
  "polymarketId()(string)" \
  --rpc-url $RPC

# Get metadata
cast call $MARKET_ADDRESS \
  "metadata()(string)" \
  --rpc-url $RPC

# Get staking deadline
cast call $MARKET_ADDRESS \
  "stakingDeadline()(uint256)" \
  --rpc-url $RPC

# Get total payout
cast call $MARKET_ADDRESS \
  "totalPayout()(uint256)" \
  --rpc-url $RPC | cast to-unit ether
```

---

## Network & Chain Info

### Chain Information
```bash
# Get current block number
cast block-number --rpc-url $RPC

# Get chain ID
cast chain-id --rpc-url $RPC

# Get latest block
cast block latest --rpc-url $RPC

# Get specific block
cast block 12345 --rpc-url $RPC

# Get gas price
cast gas-price --rpc-url $RPC

# Get base fee
cast base-fee --rpc-url $RPC
```

### NetworkConfig Queries
```bash
# Get active config
cast call $NETWORK_CONFIG_ADDRESS \
  "getActiveConfig()(address,uint256,uint256)" \
  --rpc-url $RPC

# Get chain name
cast call $NETWORK_CONFIG_ADDRESS \
  "getChainName()(string)" \
  --rpc-url $RPC

# Check if testnet
cast call $NETWORK_CONFIG_ADDRESS \
  "isTestnet()(bool)" \
  --rpc-url $RPC
```

---

## Gas & Transactions

### Estimate Gas
```bash
# Estimate gas for a transaction
cast estimate $CONTRACT_ADDRESS \
  "functionName(uint256)" \
  123 \
  --from 0xYourAddress \
  --rpc-url $RPC

# Estimate gas with value
cast estimate $CONTRACT_ADDRESS \
  "functionName()" \
  --value 1ether \
  --from 0xYourAddress \
  --rpc-url $RPC
```

### Transaction Info
```bash
# Get transaction by hash
cast tx 0xTransactionHash --rpc-url $RPC

# Get transaction receipt
cast receipt 0xTransactionHash --rpc-url $RPC

# Check if transaction succeeded
cast receipt 0xTransactionHash --rpc-url $RPC --json | jq -r .status

# Get gas used
cast receipt 0xTransactionHash --rpc-url $RPC --json | jq -r .gasUsed
```

### Send Raw Transaction
```bash
# Sign transaction
cast mktx $CONTRACT_ADDRESS \
  "functionName()" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC

# Send raw transaction
cast publish 0xSignedTransaction --rpc-url $RPC
```

---

## Events & Logs

### Query Events
```bash
# Get all events from a block range
cast logs --from-block 0 --to-block latest \
  --address $CONTRACT_ADDRESS \
  --rpc-url $RPC

# Get specific event
cast logs --from-block 0 --to-block latest \
  --address $HUB_ADDRESS \
  "CreatorRegistered(address,string,uint256)" \
  --rpc-url $RPC

# Get logs for specific event signature
cast logs --from-block 0 --to-block latest \
  --address $HUB_ADDRESS \
  --topics "0x..." \
  --rpc-url $RPC
```

### Watch Events
```bash
# Watch for new events (requires websocket)
cast logs --follow \
  --address $CONTRACT_ADDRESS \
  --rpc-url $RPC
```

### Event Signatures
```bash
# Common PredictionHub events
CreatorRegistered(address,string,uint256)
MarketCreated(address,address,string,uint256,uint256)

# Common Market events  
Staked(address,uint8,uint256)
ExecutionTriggered(address,uint8,uint256)
MarketSettled(uint8,uint256)
Claimed(address,uint256)
MarketCompleted()
```

---

## Utilities

### Data Encoding/Decoding
```bash
# Encode function call
cast calldata "functionName(uint256,address)" 123 0xAddress

# Decode function call
cast 4byte 0x12345678

# Decode function selector
cast 4byte-decode 0x12345678

# Get function selector
cast sig "functionName(uint256,address)"

# Keccak256 hash
cast keccak "Hello World"
```

### Unit Conversion
```bash
# Convert to wei
cast to-wei 1.5 ether

# Convert to ether
cast to-unit 1500000000000000000 ether

# Convert to gwei
cast to-unit 1000000000 gwei

# From hex to decimal
cast to-dec 0x1a4

# From decimal to hex
cast to-hex 420

# From hex to ASCII
cast to-ascii 0x68656c6c6f

# From ASCII to hex
cast from-utf8 "hello"
```

### Block & Timestamp
```bash
# Get current timestamp
cast block latest --rpc-url $RPC --json | jq -r .timestamp

# Calculate future timestamp (7 days from now)
echo $(($(date +%s) + 604800))

# Calculate timestamp from date
date -j -f "%Y-%m-%d" "2024-12-31" "+%s"

# Convert timestamp to date
date -r 1704067200
```

### ABI Encoding
```bash
# ABI encode
cast abi-encode "functionName(uint256,address)" 123 0xAddress

# ABI decode
cast abi-decode "functionName(uint256,address)" 0xEncodedData
```

---

## Common Workflows

### Complete Market Creation Flow
```bash
# 1. Register as creator
cast send $HUB_ADDRESS \
  "registerCreator(string,string)" \
  "Alice" "ipfs://alice" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC

# 2. Create market
DEADLINE=$(($(date +%s) + 604800))
TX=$(cast send $HUB_ADDRESS \
  "createMarket(string,string,uint256)" \
  "pm-123" "Will BTC hit 100k?" $DEADLINE \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC \
  --json)

# 3. Get market address from event logs
MARKET=$(echo $TX | jq -r '.logs[0].topics[1]' | cast parse-bytes32-address)
echo "Market created at: $MARKET"

# 4. Users stake
cast send $MARKET "stake(uint8)" 0 --value 1ether --private-key $USER1_KEY --rpc-url $RPC
cast send $MARKET "stake(uint8)" 1 --value 2ether --private-key $USER2_KEY --rpc-url $RPC

# 5. Creator triggers
cast send $MARKET "triggerExecution(uint8)" 0 --private-key $PRIVATE_KEY --rpc-url $RPC

# 6. Mock settlement
cast send $MARKET "mockPolymarketReturn(uint8,uint256)" 0 10ether --value 10ether --private-key $PRIVATE_KEY --rpc-url $RPC

# 7. Users claim
cast send $MARKET "claim()" --private-key $USER1_KEY --rpc-url $RPC
```

### Monitor Market Activity
```bash
# Check market state
watch -n 5 "cast call $MARKET_ADDRESS 'getMarketSummary()' --rpc-url $RPC"

# Watch for stakes
cast logs --follow --address $MARKET_ADDRESS "Staked(address,uint8,uint256)" --rpc-url $RPC

# Check TVL
watch -n 10 "cast call $HUB_ADDRESS 'getTotalValueLocked()' --rpc-url $RPC | cast to-unit ether"
```

### Batch Queries
```bash
# Get multiple market details
for MARKET in $(cast call $HUB_ADDRESS "getAllMarkets()" --rpc-url $RPC | jq -r '.[]'); do
  echo "Market: $MARKET"
  cast call $MARKET "metadata()" --rpc-url $RPC
  cast call $MARKET "getTotalPool()" --rpc-url $RPC | cast to-unit ether
  echo "---"
done
```

---

## Debugging

### Check Why Transaction Failed
```bash
# Get transaction receipt
cast receipt 0xFailedTxHash --rpc-url $RPC --json

# Try to replay transaction
cast run 0xFailedTxHash --rpc-url $RPC

# Get trace
cast run 0xFailedTxHash --trace --rpc-url $RPC
```

### Verify Contract Deployment
```bash
# Check code exists
cast code $CONTRACT_ADDRESS --rpc-url $RPC

# Verify it matches expected bytecode
cast code $CONTRACT_ADDRESS --rpc-url $RPC | cast keccak
```

---

## Tips & Best Practices

1. **Always test on local Anvil first:**
   ```bash
   anvil
   # Then use --rpc-url http://localhost:8545
   ```

2. **Use environment variables for repeated values:**
   ```bash
   export RPC=$CHILIZ_TESTNET_RPC
   export KEY=$PRIVATE_KEY
   ```

3. **Save important addresses:**
   ```bash
   echo "HUB=$HUB_ADDRESS" >> .env.local
   source .env.local
   ```

4. **Use `--json` flag for programmatic parsing:**
   ```bash
   cast call $CONTRACT "getData()" --rpc-url $RPC --json | jq
   ```

5. **Always check gas price before sending:**
   ```bash
   cast gas-price --rpc-url $RPC
   ```

6. **Use `--legacy` flag if EIP-1559 not supported:**
   ```bash
   cast send $CONTRACT "func()" --legacy --rpc-url $RPC
   ```

---

## Quick Reference Card

| Action | Command |
|--------|---------|
| Read function | `cast call $ADDR "func()" --rpc-url $RPC` |
| Write function | `cast send $ADDR "func()" --private-key $KEY --rpc-url $RPC` |
| Send ETH | `cast send $ADDR "func()" --value 1ether --private-key $KEY --rpc-url $RPC` |
| Check balance | `cast balance $ADDR --rpc-url $RPC` |
| Get tx receipt | `cast receipt $TX_HASH --rpc-url $RPC` |
| Estimate gas | `cast estimate $ADDR "func()" --from $FROM --rpc-url $RPC` |
| Get block | `cast block latest --rpc-url $RPC` |
| Convert units | `cast to-unit $WEI ether` |
| Function selector | `cast sig "func(uint256)"` |
| Keccak hash | `cast keccak "text"` |

---

## Additional Resources

- [Cast Documentation](https://book.getfoundry.sh/reference/cast/cast)
- [Foundry Book](https://book.getfoundry.sh/)
- [Chiliz Docs](https://docs.chiliz.com/)
- [Contract ABIs](./ABI/README.md)

---

**Remember:** Never commit private keys to version control! Always use environment variables or secure key management.

