#!/usr/bin/env bash

# Create Communities Script
# Checks if communities exist, creates only missing ones

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "🏘️  Create Communities"
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
    echo "Usage: ./create_communities.sh <prediction_hub_address>"
    exit 1
fi

# Export for forge script
export PREDICTION_HUB="$PREDICTION_HUB"

# Get addresses
CREATOR1=$(cast wallet address $CREATOR1_PRIVATE_KEY 2>/dev/null)
CREATOR2=$(cast wallet address $CREATOR2_PRIVATE_KEY 2>/dev/null)
CREATOR3=$(cast wallet address $CREATOR3_PRIVATE_KEY 2>/dev/null)

# Function to check if community exists
community_exists() {
    local community_id=$1
    local result=$(cast call $PREDICTION_HUB "communities(uint256)(uint256,string,string,string,address,uint256,uint256,uint256,bool)" $community_id --rpc-url $RPC_URL 2>/dev/null || echo "")
    
    if [ -z "$result" ] || [[ "$result" == *"0x0000000000000000000000000000000000000000"* ]]; then
        echo "false"
    else
        echo "true"
    fi
}

# Function to get creator's communities
get_creator_communities() {
    local creator=$1
    cast call $PREDICTION_HUB "getCreatorCommunities(address)(uint256[])" $creator --rpc-url $RPC_URL 2>/dev/null || echo ""
}

echo "📊 Checking existing communities..."
echo ""

# Check Creator 1's communities (Sports)
CREATOR1_COMMUNITIES=$(get_creator_communities $CREATOR1)
CREATOR1_COUNT=$(echo "$CREATOR1_COMMUNITIES" | grep -o "0x[a-fA-F0-9]\{40\}" | wc -l | tr -d ' ')

# Check Creator 2's communities (Crypto)
CREATOR2_COMMUNITIES=$(get_creator_communities $CREATOR2)
CREATOR2_COUNT=$(echo "$CREATOR2_COMMUNITIES" | grep -o "0x[a-fA-F0-9]\{40\}" | wc -l | tr -d ' ')

# Check Creator 3's communities (Politics)
CREATOR3_COMMUNITIES=$(get_creator_communities $CREATOR3)
CREATOR3_COUNT=$(echo "$CREATOR3_COMMUNITIES" | grep -o "0x[a-fA-F0-9]\{40\}" | wc -l | tr -d ' ')

echo "Creator 1 communities: $CREATOR1_COUNT"
echo "Creator 2 communities: $CREATOR2_COUNT"
echo "Creator 3 communities: $CREATOR3_COUNT"
echo ""

# If any creator has 0 communities, run the communities phase
if [ "$CREATOR1_COUNT" -eq 0 ] || [ "$CREATOR2_COUNT" -eq 0 ] || [ "$CREATOR3_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}Missing communities detected. Creating...${NC}"
    echo ""
    PREDICTION_HUB="$PREDICTION_HUB" forge script script/Seed.s.sol \
        --sig "runCommunities()" \
        --rpc-url $RPC_URL \
        --broadcast \
        --private-key $PRIVATE_KEY \
        --legacy \
        -vv
else
    echo -e "${GREEN}✅ All communities already exist${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Community Check Complete!"
echo -e "==========================================${NC}"
echo ""

