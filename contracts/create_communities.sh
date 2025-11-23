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
    cast call $PREDICTION_HUB "getCreatorCommunities(address)(uint256[])" $creator --rpc-url $RPC_URL 2>/dev/null || echo "[]"
}

# Function to check if a specific community exists by ID
check_community_exists() {
    local community_id=$1
    # Try to get the community - if it exists, we'll get data back
    local result=$(cast call $PREDICTION_HUB "communities(uint256)(uint256,string,string,string,address,uint256,uint256,uint256,bool)" $community_id --rpc-url $RPC_URL 2>/dev/null || echo "")
    # Check if result contains non-zero creator address (communities have creator field)
    if [ ! -z "$result" ] && [[ "$result" != *"0x0000000000000000000000000000000000000000"* ]]; then
        echo "true"
    else
        echo "false"
    fi
}

echo "💰 Checking account balances..."
echo ""
DEPLOYER_BALANCE=$(get_balance $DEPLOYER)
echo "Deployer balance: $DEPLOYER_BALANCE CHZ"
echo ""

echo "Ensuring creators have 10 CHZ each..."
fund_if_needed $CREATOR1 "Creator 1" "10.0"
fund_if_needed $CREATOR2 "Creator 2" "10.0"
fund_if_needed $CREATOR3 "Creator 3" "10.0"
echo ""

echo "📊 Checking existing communities..."
echo ""

# Check communities directly by ID (more reliable than checking creator mappings)
COMMUNITY0_EXISTS=$(check_community_exists 0)
COMMUNITY1_EXISTS=$(check_community_exists 1)
COMMUNITY2_EXISTS=$(check_community_exists 2)

# Also check creator mappings for reference
CREATOR1_COMMUNITIES=$(get_creator_communities $CREATOR1)
CREATOR2_COMMUNITIES=$(get_creator_communities $CREATOR2)
CREATOR3_COMMUNITIES=$(get_creator_communities $CREATOR3)

echo "Checking communities by ID:"
echo "  Community 0 (Sports): $COMMUNITY0_EXISTS"
echo "  Community 1 (Crypto): $COMMUNITY1_EXISTS"
echo "  Community 2 (Politics): $COMMUNITY2_EXISTS"
echo ""

# If any community is missing, run the communities phase
if [ "$COMMUNITY0_EXISTS" == "false" ] || [ "$COMMUNITY1_EXISTS" == "false" ] || [ "$COMMUNITY2_EXISTS" == "false" ]; then
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

