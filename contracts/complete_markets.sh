#!/usr/bin/env bash

# Complete Markets Script
# Checks if markets are completed, completes only missing ones

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "✅ Complete Markets"
echo -e "==========================================${NC}"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Load environment
if [ ! -f .env ] || [ ! -f .env.seed ]; then
    echo -e "${RED}❌ Error: .env or .env.seed not found${NC}"
    exit 1
fi

set -a
source .env
source .env.seed
set +a

RPC_URL="https://spicy-rpc.chiliz.com"
PREDICTION_HUB="$1"

if [ -z "$PREDICTION_HUB" ]; then
    echo -e "${RED}❌ Error: PredictionHub address required${NC}"
    echo ""
    echo "Usage: ./complete_markets.sh <prediction_hub_address>"
    exit 1
fi

# Export for forge script
export PREDICTION_HUB="$PREDICTION_HUB"

# Get addresses
CREATOR1=$(cast wallet address $CREATOR1_PRIVATE_KEY 2>/dev/null)
USER1=$(cast wallet address $USER1_PRIVATE_KEY 2>/dev/null)
USER2=$(cast wallet address $USER2_PRIVATE_KEY 2>/dev/null)
DEPLOYER=$(cast wallet address $PRIVATE_KEY 2>/dev/null)

# Function to get balance in CHZ
get_balance() {
    local addr=$1
    cast balance $addr --rpc-url $RPC_URL --ether 2>/dev/null | awk '{printf "%.2f", $1}'
}

# Function to calculate gas price
get_gas_price() {
    local current=$(cast gas-price --rpc-url $RPC_URL 2>/dev/null || echo "0")
    local gwei=$(echo "scale=0; $current / 1000000000" | bc 2>/dev/null || echo "2500")
    
    local safe=$(echo "scale=0; $gwei * 1.5" | bc | cut -d. -f1)
    if (( safe > 5000 )); then
        safe=5000
    fi
    if (( safe < 1000 )); then
        safe=1000
    fi
    echo $safe
}

# Function to fund account if needed
fund_if_needed() {
    local addr=$1
    local name=$2
    local required=$3
    local current=$(get_balance $addr)
    
    local current_cents=$(echo "$current * 100" | bc | cut -d. -f1)
    local required_cents=$(echo "$required * 100" | bc | cut -d. -f1)
    
    if (( current_cents < required_cents )); then
        local needed=$(echo "$required - $current" | bc)
        # Format to ensure leading zero for values < 1
        if [[ "$needed" =~ ^\. ]]; then
            needed="0$needed"
        fi
        echo -e "${YELLOW}  Funding $name: $needed CHZ${NC}"
        GAS_PRICE=$(get_gas_price)
        cast send $addr --value "${needed}ether" --private-key $PRIVATE_KEY --rpc-url $RPC_URL --legacy --gas-price ${GAS_PRICE}gwei > /dev/null 2>&1
        echo -e "${GREEN}  ✅ Funded $name${NC}"
    else
        echo -e "${GREEN}  ✅ $name: $current CHZ${NC}"
    fi
}

# Check and fund accounts
echo "💰 Checking account balances..."
echo ""
DEPLOYER_BALANCE=$(get_balance $DEPLOYER)
echo "Deployer balance: $DEPLOYER_BALANCE CHZ"
echo ""

echo "Ensuring accounts have 10 CHZ each..."
fund_if_needed $CREATOR1 "Creator 1" "10.0"
fund_if_needed $USER1 "User 1" "10.0"
fund_if_needed $USER2 "User 2" "10.0"
echo ""

# Function to get community markets
get_community_markets() {
    local community_id=$1
    cast call $PREDICTION_HUB "getCommunityMarkets(uint256)(address[])" $community_id --rpc-url $RPC_URL 2>/dev/null || echo "[]"
}

# Function to check if market is completed
is_market_completed() {
    local market=$1
    
    # Check Market contract status
    # Market should have a status field or isExecuted/isSettled
    local status=$(cast call $market "status()(uint8)" --rpc-url $RPC_URL 2>/dev/null || echo "0")
    local is_executed=$(cast call $market "isExecuted()(bool)" --rpc-url $RPC_URL 2>/dev/null || echo "false")
    local is_settled=$(cast call $market "isSettled()(bool)" --rpc-url $RPC_URL 2>/dev/null || echo "false")
    
    # If status is 2 or 3 (completed/settled), or isExecuted/isSettled is true
    if [ "$status" == "2" ] || [ "$status" == "3" ] || [ "$is_executed" == "true" ] || [ "$is_settled" == "true" ]; then
        echo "true"
    else
        echo "false"
    fi
}

echo "📊 Checking completed markets..."
echo ""

# Get markets from community 1 (Sports) - we'll complete one market from here
COMMUNITY1_MARKETS=$(get_community_markets 1)

# Extract first market address
FIRST_MARKET=$(echo "$COMMUNITY1_MARKETS" | grep -o "0x[a-fA-F0-9]\{40\}" | head -1)

COMPLETED_COUNT=0
TOTAL_MARKETS=0

# Check all markets for completion status
if [ ! -z "$COMMUNITY1_MARKETS" ]; then
    for market in $(echo "$COMMUNITY1_MARKETS" | grep -o "0x[a-fA-F0-9]\{40\}"); do
        if [ ! -z "$market" ] && [ "$market" != "0x0000000000000000000000000000000000000000" ]; then
            TOTAL_MARKETS=$((TOTAL_MARKETS + 1))
            local is_completed=$(is_market_completed $market)
            if [ "$is_completed" == "true" ]; then
                COMPLETED_COUNT=$((COMPLETED_COUNT + 1))
            fi
        fi
    done
fi

echo "Found $TOTAL_MARKETS markets"
echo "Completed: $COMPLETED_COUNT"
echo ""

# We expect at least 1 completed market for demo
if [ "$COMPLETED_COUNT" -lt 1 ]; then
    echo -e "${YELLOW}No completed markets found. Creating and completing a sample market...${NC}"
    echo ""
    PREDICTION_HUB="$PREDICTION_HUB" forge script script/Seed.s.sol \
        --sig "runComplete()" \
        --rpc-url $RPC_URL \
        --broadcast \
        --private-key $PRIVATE_KEY \
        --legacy \
        -vv
else
    echo -e "${GREEN}✅ At least one market is already completed${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Market Completion Check Complete!"
echo -e "==========================================${NC}"
echo ""

