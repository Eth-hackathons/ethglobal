#!/bin/bash

# Fresh deployment script that handles stuck transactions
# This uses --resume flag to handle stuck nonces

RPC_URL="https://spicy-rpc.chiliz.com"

echo "=========================================="
echo "🚀 Fresh Deployment Attempt"
echo "=========================================="
echo ""

# Check wallet balance first
echo "1️⃣ Checking wallet balance..."
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY 2>/dev/null)
if [ -z "$DEPLOYER" ]; then
    echo "❌ Error: PRIVATE_KEY not set in environment"
    echo "Run: export PRIVATE_KEY=your_private_key"
    exit 1
fi

echo "   Deployer: $DEPLOYER"

BALANCE=$(cast balance $DEPLOYER --rpc-url $RPC_URL 2>/dev/null)
if [ -z "$BALANCE" ]; then
    echo "❌ Error: Cannot connect to RPC"
    exit 1
fi

# Convert balance from wei to CHZ (18 decimals)
BALANCE_CHZ=$(echo "scale=4; $BALANCE / 1000000000000000000" | bc)
echo "   Balance: $BALANCE_CHZ CHZ"

if (( $(echo "$BALANCE_CHZ < 20" | bc -l) )); then
    echo "⚠️  Warning: Balance might be too low for deployment (need ~20 CHZ)"
    echo "   Get testnet CHZ from: https://spicy-faucet.chiliz.com/"
fi

echo ""
echo "2️⃣ Checking current nonce..."
CURRENT_NONCE=$(cast nonce $DEPLOYER --rpc-url $RPC_URL 2>/dev/null)
echo "   Current nonce: $CURRENT_NONCE"

echo ""
echo "3️⃣ Starting deployment with higher gas price..."
echo ""

# Deploy with higher gas price to replace stuck transactions
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --legacy \
  --with-gas-price 10000gwei \
  --skip-simulation

echo ""
echo "=========================================="
echo "✅ Deployment command completed"
echo "=========================================="
echo ""
echo "Run ./check_deployment.sh to verify"

