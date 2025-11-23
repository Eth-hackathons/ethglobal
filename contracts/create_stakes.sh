#!/usr/bin/env bash

# Create Stakes Script
# Checks if stakes exist, creates only missing ones

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "💰 Create Stakes"
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
    echo "Usage: ./create_stakes.sh <prediction_hub_address>"
    exit 1
fi

# Export for forge script
export PREDICTION_HUB="$PREDICTION_HUB"

# Get addresses
CREATOR1=$(cast wallet address $CREATOR1_PRIVATE_KEY 2>/dev/null)
USER1=$(cast wallet address $USER1_PRIVATE_KEY 2>/dev/null)
USER2=$(cast wallet address $USER2_PRIVATE_KEY 2>/dev/null)
USER3=$(cast wallet address $USER3_PRIVATE_KEY 2>/dev/null)
USER4=$(cast wallet address $USER4_PRIVATE_KEY 2>/dev/null)
USER5=$(cast wallet address $USER5_PRIVATE_KEY 2>/dev/null)
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

echo "Ensuring users have 10 CHZ each..."
fund_if_needed $USER1 "User 1" "10.0"
fund_if_needed $USER2 "User 2" "10.0"
fund_if_needed $USER3 "User 3" "10.0"
fund_if_needed $USER4 "User 4" "10.0"
fund_if_needed $USER5 "User 5" "10.0"
echo ""

# Function to get community markets
get_community_markets() {
    local community_id=$1
    cast call $PREDICTION_HUB "getCommunityMarkets(uint256)(address[])" $community_id --rpc-url $RPC_URL 2>/dev/null || echo "[]"
}

# Function to check if user has staked in a market
has_staked() {
    local market=$1
    local user=$2
    
    # Check Market contract for user's stake
    # This would need to call the Market contract's stake mapping
    # For now, we'll use a simpler check - see if market has any stakes
    local total_staked=$(cast call $market "totalStaked()(uint256)" --rpc-url $RPC_URL 2>/dev/null || echo "0")
    
    if [ "$total_staked" == "0" ] || [ -z "$total_staked" ]; then
        echo "false"
    else
        # Check user's specific stake
        local user_stake=$(cast call $market "stakes(address)(uint256)" $user --rpc-url $RPC_URL 2>/dev/null || echo "0")
        if [ "$user_stake" == "0" ] || [ -z "$user_stake" ]; then
            echo "false"
        else
            echo "true"
        fi
    fi
}

echo "📊 Checking existing stakes..."
echo ""

# Get markets from each community
COMMUNITY1_MARKETS=$(get_community_markets 1)
COMMUNITY2_MARKETS=$(get_community_markets 2)
COMMUNITY3_MARKETS=$(get_community_markets 3)

# Extract market addresses
MARKETS1=$(echo "$COMMUNITY1_MARKETS" | grep -o "0x[a-fA-F0-9]\{40\}" | head -2)
MARKETS2=$(echo "$COMMUNITY2_MARKETS" | grep -o "0x[a-fA-F0-9]\{40\}" | head -2)
MARKETS3=$(echo "$COMMUNITY3_MARKETS" | grep -o "0x[a-fA-F0-9]\{40\}" | head -2)

STAKES_NEEDED=0

# Check if markets have stakes
if [ ! -z "$MARKETS1" ]; then
    for market in $MARKETS1; do
        if [ ! -z "$market" ] && [ "$market" != "0x0000000000000000000000000000000000000000" ]; then
            has_stakes=$(has_staked $market $USER1)
            if [ "$has_stakes" == "false" ]; then
                STAKES_NEEDED=1
                break
            fi
        fi
    done
fi

if [ "$STAKES_NEEDED" -eq 0 ] && [ ! -z "$MARKETS2" ]; then
    for market in $MARKETS2; do
        if [ ! -z "$market" ] && [ "$market" != "0x0000000000000000000000000000000000" ]; then
            has_stakes=$(has_staked $market $USER1)
            if [ "$has_stakes" == "false" ]; then
                STAKES_NEEDED=1
                break
            fi
        fi
    done
fi

if [ "$STAKES_NEEDED" -eq 1 ]; then
    echo -e "${YELLOW}Missing stakes detected. Creating stakes...${NC}"
    echo ""
    PREDICTION_HUB="$PREDICTION_HUB" forge script script/Seed.s.sol \
        --sig "runStakes()" \
        --rpc-url $RPC_URL \
        --broadcast \
        --private-key $PRIVATE_KEY \
        --legacy \
        -vv
else
    echo -e "${GREEN}✅ All expected stakes already exist${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Stake Check Complete!"
echo -e "==========================================${NC}"
echo ""

