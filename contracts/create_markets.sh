#!/usr/bin/env bash

# Create Markets Script
# Checks if markets exist, creates only missing ones

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "📊 Create Markets"
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
    echo "Usage: ./create_markets.sh <prediction_hub_address>"
    exit 1
fi

# Export for forge script
export PREDICTION_HUB="$PREDICTION_HUB"

# Get addresses
CREATOR1=$(cast wallet address $CREATOR1_PRIVATE_KEY 2>/dev/null)
CREATOR2=$(cast wallet address $CREATOR2_PRIVATE_KEY 2>/dev/null)
CREATOR3=$(cast wallet address $CREATOR3_PRIVATE_KEY 2>/dev/null)

# Function to get community markets
get_community_markets() {
    local community_id=$1
    cast call $PREDICTION_HUB "getCommunityMarkets(uint256)(address[])" $community_id --rpc-url $RPC_URL 2>/dev/null || echo "[]"
}

# Function to check if market exists for a community
market_exists() {
    local community_id=$1
    local market_key=$2
    local markets=$(get_community_markets $community_id)
    
    # Check if markets array has any addresses
    if [ -z "$markets" ] || [[ "$markets" == "[]" ]] || [[ "$markets" == *"0x0000000000000000000000000000000000000000"* ]]; then
        echo "false"
    else
        # For now, assume if community has markets, we check count
        # In a real scenario, you'd check specific market keys
        local count=$(echo "$markets" | grep -o "0x[a-fA-F0-9]\{40\}" | wc -l | tr -d ' ')
        if [ "$count" -gt 0 ]; then
            echo "true"
        else
            echo "false"
        fi
    fi
}

echo "📊 Checking existing markets..."
echo ""

# Expected markets per community
# Community 1 (Sports): 2 markets
# Community 2 (Crypto): 2 markets  
# Community 3 (Politics): 2 markets

COMMUNITY1_MARKETS=$(get_community_markets 1)
COMMUNITY2_MARKETS=$(get_community_markets 2)
COMMUNITY3_MARKETS=$(get_community_markets 3)

COUNT1=$(echo "$COMMUNITY1_MARKETS" | grep -o "0x[a-fA-F0-9]\{40\}" | wc -l | tr -d ' ')
COUNT2=$(echo "$COMMUNITY2_MARKETS" | grep -o "0x[a-fA-F0-9]\{40\}" | wc -l | tr -d ' ')
COUNT3=$(echo "$COMMUNITY3_MARKETS" | grep -o "0x[a-fA-F0-9]\{40\}" | wc -l | tr -d ' ')

echo "Community 1 (Sports): $COUNT1 markets"
echo "Community 2 (Crypto): $COUNT2 markets"
echo "Community 3 (Politics): $COUNT3 markets"
echo ""

# Create missing markets using the Seed script's market creation function
# If any are missing, run the markets phase
if [ "$COUNT1" -lt 2 ] || [ "$COUNT2" -lt 2 ] || [ "$COUNT3" -lt 2 ]; then
    echo ""
    echo -e "${YELLOW}Missing markets detected. Creating...${NC}"
    PREDICTION_HUB="$PREDICTION_HUB" forge script script/Seed.s.sol \
        --sig "runMarkets()" \
        --rpc-url $RPC_URL \
        --broadcast \
        --private-key $PRIVATE_KEY \
        --legacy \
        -vv
else
    echo -e "${GREEN}✅ All markets already exist${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Market Check Complete!"
echo -e "==========================================${NC}"
echo ""

