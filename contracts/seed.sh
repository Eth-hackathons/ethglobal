#!/usr/bin/env bash

# Smart Seeding Script - Modular, Resilient, Idempotent
# Can run specific phases or all phases
# Checks balances and funds only what's needed

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RPC_URL="https://spicy-rpc.chiliz.com"
CHAIN_ID=88882

echo -e "${BLUE}=========================================="
echo "🌱 Smart Seeding Script"
echo -e "==========================================${NC}"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Load environment variables
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env not found${NC}"
    exit 1
fi

if [ ! -f .env.seed ]; then
    echo -e "${RED}❌ Error: .env.seed not found${NC}"
    echo "Run ./generate_wallets.sh first"
    exit 1
fi

set -a  # automatically export all variables
source .env
source .env.seed
set +a

# Get prediction hub address
PREDICTION_HUB="$1"
PHASE="${2:-all}"  # Default to 'all' if not specified

if [ -z "$PREDICTION_HUB" ]; then
    echo -e "${RED}❌ Error: PredictionHub address required${NC}"
    echo ""
    echo "Usage: ./seed.sh <prediction_hub_address> [phase]"
    echo ""
    echo "Phases:"
    echo "  all         - Run all phases (default)"
    echo "  fund        - Fund accounts only"
    echo "  creators    - Register creators"
    echo "  communities - Create communities"
    echo "  users       - Users join communities"
    echo "  markets     - Create markets"
    echo "  stakes      - Stake in markets"
    echo "  complete    - Complete sample markets"
    echo "  status      - Check seeding status"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ Error: PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

# Get addresses
DEPLOYER=$(cast wallet address $PRIVATE_KEY 2>/dev/null)
CREATOR1=$(cast wallet address $CREATOR1_PRIVATE_KEY 2>/dev/null)
CREATOR2=$(cast wallet address $CREATOR2_PRIVATE_KEY 2>/dev/null)
CREATOR3=$(cast wallet address $CREATOR3_PRIVATE_KEY 2>/dev/null)
USER1=$(cast wallet address $USER1_PRIVATE_KEY 2>/dev/null)
USER2=$(cast wallet address $USER2_PRIVATE_KEY 2>/dev/null)
USER3=$(cast wallet address $USER3_PRIVATE_KEY 2>/dev/null)
USER4=$(cast wallet address $USER4_PRIVATE_KEY 2>/dev/null)
USER5=$(cast wallet address $USER5_PRIVATE_KEY 2>/dev/null)

echo "📋 Configuration:"
echo "  PredictionHub: $PREDICTION_HUB"
echo "  Deployer: $DEPLOYER"
echo "  Phase: $PHASE"
echo ""

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

# Function to check if address is registered as creator
is_creator() {
    local addr=$1
    local result=$(cast call $PREDICTION_HUB "isCreator(address)(bool)" $addr --rpc-url $RPC_URL 2>/dev/null || echo "false")
    if [[ "$result" == "true" ]] || [[ "$result" == *"0000000000000000000000000000000000000000000000000000000000000001"* ]]; then
        echo "true"
    else
        echo "false"
    fi
}

# Function to get creator's communities
get_creator_communities() {
    local addr=$1
    cast call $PREDICTION_HUB "getCreatorCommunities(address)(uint256[])" $addr --rpc-url $RPC_URL 2>/dev/null || echo "[]"
}

# Function to check account status
check_status() {
    echo -e "${BLUE}=========================================="
    echo "📊 Seeding Status Check"
    echo -e "==========================================${NC}"
    echo ""
    
    echo "Deployer Balance: $(get_balance $DEPLOYER) CHZ"
    echo ""
    
    echo "Creator Accounts:"
    local c1_reg=$(is_creator $CREATOR1)
    local c2_reg=$(is_creator $CREATOR2)
    local c3_reg=$(is_creator $CREATOR3)
    
    echo "  Creator 1: $(get_balance $CREATOR1) CHZ | Registered: $c1_reg"
    echo "  Creator 2: $(get_balance $CREATOR2) CHZ | Registered: $c2_reg"
    echo "  Creator 3: $(get_balance $CREATOR3) CHZ | Registered: $c3_reg"
    echo ""
    
    echo "User Accounts:"
    echo "  User 1: $(get_balance $USER1) CHZ"
    echo "  User 2: $(get_balance $USER2) CHZ"
    echo "  User 3: $(get_balance $USER3) CHZ"
    echo "  User 4: $(get_balance $USER4) CHZ"
    echo "  User 5: $(get_balance $USER5) CHZ"
    echo ""
}

# Function to fund account only if needed
fund_if_needed() {
    local addr=$1
    local name=$2
    local required=$3
    local current=$(get_balance $addr)
    
    # Compare balances (bash doesn't handle floats well, so multiply by 100)
    local current_cents=$(echo "$current * 100" | bc | cut -d. -f1)
    local required_cents=$(echo "$required * 100" | bc | cut -d. -f1)
    
    if (( current_cents < required_cents )); then
        local needed=$(echo "$required - $current" | bc)
        echo -e "${YELLOW}  Funding $name: $needed CHZ (current: $current, need: $required)${NC}"
        cast send $addr --value "${needed}ether" --private-key $PRIVATE_KEY --rpc-url $RPC_URL --legacy --gas-price ${GAS_PRICE}gwei > /dev/null 2>&1
        echo -e "${GREEN}  ✅ Funded $name${NC}"
    else
        echo -e "${GREEN}  ✅ $name has sufficient balance: $current CHZ${NC}"
    fi
}

# Function to fund accounts
fund_accounts() {
    echo -e "${BLUE}=========================================="
    echo "💰 Funding Accounts"
    echo -e "==========================================${NC}"
    echo ""
    
    local deployer_balance=$(get_balance $DEPLOYER)
    echo "Deployer balance: $deployer_balance CHZ"
    
    if (( $(echo "$deployer_balance < 25" | bc -l) )); then
        echo -e "${YELLOW}⚠️  Warning: Low deployer balance${NC}"
        echo "Get CHZ from: https://spicy-faucet.chiliz.com"
        echo ""
    fi
    
    echo "Checking and funding accounts..."
    
    # Fund creators (need more for creating communities and markets)
    fund_if_needed $CREATOR1 "Creator 1" "5.0"
    fund_if_needed $CREATOR2 "Creator 2" "4.0"
    fund_if_needed $CREATOR3 "Creator 3" "4.0"
    
    # Fund users (need less, mainly for staking)
    fund_if_needed $USER1 "User 1" "2.0"
    fund_if_needed $USER2 "User 2" "2.0"
    fund_if_needed $USER3 "User 3" "1.0"
    fund_if_needed $USER4 "User 4" "1.0"
    fund_if_needed $USER5 "User 5" "1.0"
    
    echo ""
    echo -e "${GREEN}✅ Funding complete!${NC}"
    echo ""
}

# Function to run a specific phase
run_phase() {
    local phase=$1
    
    echo -e "${BLUE}=========================================="
    echo "🚀 Running Phase: $phase"
    echo -e "==========================================${NC}"
    echo ""
    
    forge script script/Seed.s.sol \
        --sig "run${phase}()" \
        --rpc-url $RPC_URL \
        --broadcast \
        --private-key $PRIVATE_KEY \
        --legacy \
        --with-gas-price ${GAS_PRICE}gwei \
        -vv
}

# Function to run all phases
run_all_phases() {
    echo -e "${BLUE}=========================================="
    echo "🚀 Running All Phases"
    echo -e "==========================================${NC}"
    echo ""
    
    forge script script/Seed.s.sol \
        --rpc-url $RPC_URL \
        --broadcast \
        --private-key $PRIVATE_KEY \
        --legacy \
        --with-gas-price ${GAS_PRICE}gwei \
        -vv
}

# Get current gas price
GAS_PRICE=$(get_gas_price)
echo "⛽ Gas price: $GAS_PRICE gwei"
echo ""

# Execute based on phase
case "$PHASE" in
    "status")
        check_status
        ;;
    "fund")
        fund_accounts
        ;;
    "creators")
        fund_accounts
        run_phase "Creators"
        ;;
    "communities")
        fund_accounts
        run_phase "Communities"
        ;;
    "users")
        fund_accounts
        run_phase "Users"
        ;;
    "markets")
        fund_accounts
        run_phase "Markets"
        ;;
    "stakes")
        fund_accounts
        run_phase "Stakes"
        ;;
    "complete")
        fund_accounts
        run_phase "Complete"
        ;;
    "all")
        fund_accounts
        run_all_phases
        echo ""
        echo -e "${GREEN}=========================================="
        echo "✅ Seeding Complete!"
        echo -e "==========================================${NC}"
        echo ""
        check_status
        ;;
    *)
        echo -e "${RED}❌ Unknown phase: $PHASE${NC}"
        echo ""
        echo "Available phases: all, fund, creators, communities, users, markets, stakes, complete, status"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
