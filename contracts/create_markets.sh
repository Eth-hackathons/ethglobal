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
    
    # Use current + 50% buffer, cap at 5000, min 1000
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
    
    # Compare balances (multiply by 100 to handle decimals)
    local current_cents=$(echo "$current * 100" | bc | cut -d. -f1)
    local required_cents=$(echo "$required * 100" | bc | cut -d. -f1)
    
    if (( current_cents < required_cents )); then
        local needed=$(echo "$required - $current" | bc)
        # Format to ensure leading zero for values < 1
        if [[ "$needed" =~ ^\. ]]; then
            needed="0$needed"
        fi
        echo -e "${YELLOW}  Funding $name: $needed CHZ (current: $current, need: $required)${NC}"
        GAS_PRICE=$(get_gas_price)
        cast send $addr --value "${needed}ether" --private-key $PRIVATE_KEY --rpc-url $RPC_URL --legacy --gas-price ${GAS_PRICE}gwei > /dev/null 2>&1
        echo -e "${GREEN}  ✅ Funded $name${NC}"
    else
        echo -e "${GREEN}  ✅ $name has sufficient balance: $current CHZ${NC}"
    fi
}

# Function to get community markets
get_community_markets() {
    local community_id=$1
    cast call $PREDICTION_HUB "getCommunityMarkets(uint256)(address[])" $community_id --rpc-url $RPC_URL 2>/dev/null || echo "[]"
}

# Function to get community markets count
get_community_markets_count() {
    local community_id=$1
    local markets=$(get_community_markets $community_id)
    echo "$markets" | grep -o "0x[a-fA-F0-9]\{40\}" | wc -l | tr -d ' '
}

# Check and fund accounts before creating markets
echo "💰 Checking account balances and market needs..."
echo ""
DEPLOYER_BALANCE=$(get_balance $DEPLOYER)
echo "Deployer balance: $DEPLOYER_BALANCE CHZ"
echo ""

if (( $(echo "$DEPLOYER_BALANCE < 20" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Warning: Low deployer balance${NC}"
    echo "Get CHZ from: https://spicy-faucet.chiliz.com"
    echo ""
fi

# Get actual community IDs from creators
CREATOR1_COMMUNITIES=$(cast call $PREDICTION_HUB "getCreatorCommunities(address)(uint256[])" $CREATOR1 --rpc-url $RPC_URL 2>/dev/null || echo "[]")
CREATOR2_COMMUNITIES=$(cast call $PREDICTION_HUB "getCreatorCommunities(address)(uint256[])" $CREATOR2 --rpc-url $RPC_URL 2>/dev/null || echo "[]")
CREATOR3_COMMUNITIES=$(cast call $PREDICTION_HUB "getCreatorCommunities(address)(uint256[])" $CREATOR3 --rpc-url $RPC_URL 2>/dev/null || echo "[]")

# Extract first community ID for each creator
COMMUNITY_ID_1=$(echo "$CREATOR1_COMMUNITIES" | tr ',' ' ' | tr '[' ' ' | tr ']' ' ' | grep -oE '[0-9]+' | head -1)
COMMUNITY_ID_2=$(echo "$CREATOR2_COMMUNITIES" | tr ',' ' ' | tr '[' ' ' | tr ']' ' ' | grep -oE '[0-9]+' | head -1)
COMMUNITY_ID_3=$(echo "$CREATOR3_COMMUNITIES" | tr ',' ' ' | tr '[' ' ' | tr ']' ' ' | grep -oE '[0-9]+' | head -1)

# Check how many markets exist and need to be created
COMMUNITY1_COUNT=$(get_community_markets_count $COMMUNITY_ID_1)
COMMUNITY2_COUNT=$(get_community_markets_count $COMMUNITY_ID_2)
COMMUNITY3_COUNT=$(get_community_markets_count $COMMUNITY_ID_3)

MARKETS_NEEDED_1=$((2 - COMMUNITY1_COUNT))
MARKETS_NEEDED_2=$((2 - COMMUNITY2_COUNT))
MARKETS_NEEDED_3=$((2 - COMMUNITY3_COUNT))

echo "Market status:"
echo "  Creator 1 (Community $COMMUNITY_ID_1): $COMMUNITY1_COUNT/2 markets"
echo "  Creator 2 (Community $COMMUNITY_ID_2): $COMMUNITY2_COUNT/2 markets"
echo "  Creator 3 (Community $COMMUNITY_ID_3): $COMMUNITY3_COUNT/2 markets"
echo ""

echo "Ensuring creators have 10 CHZ each..."
fund_if_needed $CREATOR1 "Creator 1" "10.0"
fund_if_needed $CREATOR2 "Creator 2" "10.0"
fund_if_needed $CREATOR3 "Creator 3" "10.0"
echo ""

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

