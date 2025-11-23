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

