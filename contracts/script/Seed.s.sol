// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/PredictionHub.sol";
import "../src/Market.sol";
import "../src/NetworkConfig.sol";

/**
 * @title Seed
 * @notice Populates the PredictionHub with sample data for testing/demo
 * @dev Run with: forge script script/Seed.s.sol --rpc-url <RPC> --broadcast
 */
contract Seed is Script {
    PredictionHub public hub;
    NetworkConfig public networkConfig;
    
    // Test accounts (loaded from environment)
    address public creator1;
    address public creator2;
    address public creator3;
    address public user1;
    address public user2;
    address public user3;
    address public user4;
    address public user5;
    
    // Private keys for broadcasting
    uint256 public creator1PK;
    uint256 public creator2PK;
    uint256 public creator3PK;
    uint256 public user1PK;
    uint256 public user2PK;
    uint256 public user3PK;
    uint256 public user4PK;
    uint256 public user5PK;
    
    // Initialize contract and accounts
    function _initialize() internal {
        // Load deployed contract addresses from environment or use defaults
        address hubAddress = vm.envOr("PREDICTION_HUB", address(0x3C216a0d69d98d0b7C7644a94b4b7E5F1A81476D));
        hub = PredictionHub(hubAddress);
        
        // Load test account private keys from environment
        creator1PK = vm.envUint("CREATOR1_PRIVATE_KEY");
        creator2PK = vm.envUint("CREATOR2_PRIVATE_KEY");
        creator3PK = vm.envUint("CREATOR3_PRIVATE_KEY");
        user1PK = vm.envUint("USER1_PRIVATE_KEY");
        user2PK = vm.envUint("USER2_PRIVATE_KEY");
        user3PK = vm.envUint("USER3_PRIVATE_KEY");
        user4PK = vm.envUint("USER4_PRIVATE_KEY");
        user5PK = vm.envUint("USER5_PRIVATE_KEY");
        
        // Derive addresses from private keys
        creator1 = vm.addr(creator1PK);
        creator2 = vm.addr(creator2PK);
        creator3 = vm.addr(creator3PK);
        user1 = vm.addr(user1PK);
        user2 = vm.addr(user2PK);
        user3 = vm.addr(user3PK);
        user4 = vm.addr(user4PK);
        user5 = vm.addr(user5PK);
    }
    
    // Main run function - executes all phases
    function run() external {
        _initialize();
        
        console.log("\n========================================");
        console.log("Seeding PredictionHub - All Phases");
        console.log("========================================");
        console.log("Hub Address:", address(hub));
        
        // PHASE 1: Register Creators
        console.log("\n========================================");
        console.log("PHASE 1: Registering Creators");
        console.log("========================================");
        _registerCreators();
        
        // PHASE 2: Create Communities
        console.log("\n========================================");
        console.log("PHASE 2: Creating Communities");
        console.log("========================================");
        uint256[] memory communityIds = _createCommunities();
        
        // PHASE 3: Users Join Communities
        console.log("\n========================================");
        console.log("PHASE 3: Users Joining Communities");
        console.log("========================================");
        _usersJoinCommunities(communityIds);
        
        // PHASE 4: Create Active Markets
        console.log("\n========================================");
        console.log("PHASE 4: Creating Active Markets");
        console.log("========================================");
        address[] memory activeMarkets = _createActiveMarkets(communityIds);
        
        // PHASE 5: Stake in Active Markets
        console.log("\n========================================");
        console.log("PHASE 5: Staking in Markets");
        console.log("========================================");
        _stakeInMarkets(activeMarkets);
        
        // PHASE 6: Create and Complete Some Markets
        console.log("\n========================================");
        console.log("PHASE 6: Completing Sample Markets");
        console.log("========================================");
        _createAndCompleteMarkets(communityIds);
        
        // PHASE 7: Summary
        console.log("\n========================================");
        console.log("SEEDING SUMMARY");
        console.log("========================================");
        _printSummary();
    }
    
    // Individual phase runners (can be called separately)
    function runCreators() external {
        _initialize();
        console.log("\n=== Running Phase: Creators ===\n");
        _registerCreators();
        console.log("\n=== Phase Complete ===\n");
    }
    
    function runCommunities() external {
        _initialize();
        console.log("\n=== Running Phase: Communities ===\n");
        uint256[] memory communityIds = _createCommunities();
        console.log("Created", communityIds.length, "communities");
        console.log("\n=== Phase Complete ===\n");
    }
    
    function runUsers() external {
        _initialize();
        console.log("\n=== Running Phase: Users ===\n");
        // Get communities from contract
        uint256[] memory communityIds = new uint256[](3);
        communityIds[0] = 1;
        communityIds[1] = 2;
        communityIds[2] = 3;
        _usersJoinCommunities(communityIds);
        console.log("\n=== Phase Complete ===\n");
    }
    
    function runMarkets() external {
        _initialize();
        console.log("\n=== Running Phase: Markets ===\n");
        uint256[] memory communityIds = new uint256[](3);
        communityIds[0] = 1;
        communityIds[1] = 2;
        communityIds[2] = 3;
        address[] memory markets = _createActiveMarkets(communityIds);
        console.log("Created", markets.length, "markets");
        console.log("\n=== Phase Complete ===\n");
    }
    
    function runStakes() external {
        _initialize();
        console.log("\n=== Running Phase: Stakes ===\n");
        // Get market addresses from creator1's markets
        address[] memory markets = hub.getCreatorMarkets(creator1);
        require(markets.length > 0, "No markets found. Run 'markets' phase first.");
        _stakeInMarkets(markets);
        console.log("\n=== Phase Complete ===\n");
    }
    
    function runComplete() external {
        _initialize();
        console.log("\n=== Running Phase: Complete ===\n");
        uint256[] memory communityIds = new uint256[](3);
        communityIds[0] = 1;
        communityIds[1] = 2;
        communityIds[2] = 3;
        _createAndCompleteMarkets(communityIds);
        console.log("\n=== Phase Complete ===\n");
    }
    
    // PHASE 1: Register Creators
    function _registerCreators() internal {
        // Creator 1: Sports Expert
        if (!hub.isCreator(creator1)) {
            vm.broadcast(creator1PK);
            hub.registerCreator("Elite Sports Analyst", "ipfs://QmSportsAnalyst123");
            console.log("[OK] Registered: Elite Sports Analyst");
        } else {
            console.log("[SKIP] Already registered: Elite Sports Analyst");
        }
        
        // Creator 2: Crypto Guru
        if (!hub.isCreator(creator2)) {
            vm.broadcast(creator2PK);
            hub.registerCreator("Crypto Prophet", "ipfs://QmCryptoProphet456");
            console.log("[OK] Registered: Crypto Prophet");
        } else {
            console.log("[SKIP] Already registered: Crypto Prophet");
        }
        
        // Creator 3: Politics Expert
        if (!hub.isCreator(creator3)) {
            vm.broadcast(creator3PK);
            hub.registerCreator("Political Oracle", "ipfs://QmPoliticalOracle789");
            console.log("[OK] Registered: Political Oracle");
        } else {
            console.log("[SKIP] Already registered: Political Oracle");
        }
    }
    
    function _createCommunities() internal returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](3);
        
        // Check Creator 1's communities
        uint256[] memory creator1Communities = hub.getCreatorCommunities(creator1);
        if (creator1Communities.length > 0) {
            ids[0] = creator1Communities[0];
            console.log("[SKIP] Sports Predictions already exists (ID:", ids[0], ")");
        } else {
            vm.broadcast(creator1PK);
            ids[0] = hub.createCommunity(
                "Sports Predictions",
                "Community for sports betting enthusiasts. Football, basketball, tennis and more!",
                "ipfs://QmSportsCommunity"
            );
            console.log("[OK] Created: Sports Predictions (ID:", ids[0], ")");
        }
        
        // Check Creator 2's communities
        uint256[] memory creator2Communities = hub.getCreatorCommunities(creator2);
        if (creator2Communities.length > 0) {
            ids[1] = creator2Communities[0];
            console.log("[SKIP] Crypto Markets already exists (ID:", ids[1], ")");
        } else {
            vm.broadcast(creator2PK);
            ids[1] = hub.createCommunity(
                "Crypto Markets",
                "Predict crypto prices, DeFi trends, and blockchain adoption",
                "ipfs://QmCryptoCommunity"
            );
            console.log("[OK] Created: Crypto Markets (ID:", ids[1], ")");
        }
        
        // Check Creator 3's communities
        uint256[] memory creator3Communities = hub.getCreatorCommunities(creator3);
        if (creator3Communities.length > 0) {
            ids[2] = creator3Communities[0];
            console.log("[SKIP] Political Events already exists (ID:", ids[2], ")");
        } else {
            vm.broadcast(creator3PK);
            ids[2] = hub.createCommunity(
                "Political Events",
                "Elections, policy decisions, and global political outcomes",
                "ipfs://QmPoliticsCommunity"
            );
            console.log("[OK] Created: Political Events (ID:", ids[2], ")");
        }
        
        return ids;
    }
    
    function _usersJoinCommunities(uint256[] memory communityIds) internal {
        // User 1 joins all communities
        vm.startBroadcast(user1PK);
        hub.joinCommunity(communityIds[0]);
        hub.joinCommunity(communityIds[1]);
        hub.joinCommunity(communityIds[2]);
        vm.stopBroadcast();
        console.log("[OK] User 1 joined all communities");
        
        // User 2 joins Sports and Crypto
        vm.startBroadcast(user2PK);
        hub.joinCommunity(communityIds[0]);
        hub.joinCommunity(communityIds[1]);
        vm.stopBroadcast();
        console.log("[OK] User 2 joined Sports & Crypto");
        
        // User 3 joins Sports
        vm.broadcast(user3PK);
        hub.joinCommunity(communityIds[0]);
        console.log("[OK] User 3 joined Sports");
        
        // User 4 joins Crypto
        vm.broadcast(user4PK);
        hub.joinCommunity(communityIds[1]);
        console.log("[OK] User 4 joined Crypto");
        
        // User 5 joins Politics
        vm.broadcast(user5PK);
        hub.joinCommunity(communityIds[2]);
        console.log("[OK] User 5 joined Politics");
    }
    
    function _createActiveMarkets(uint256[] memory communityIds) internal returns (address[] memory) {
        address[] memory markets = new address[](6);
        uint256 baseDeadline = block.timestamp + 7 days;
        
        // Check existing markets for each community
        address[] memory existingMarkets1 = hub.getCommunityMarkets(communityIds[0]);
        address[] memory existingMarkets2 = hub.getCommunityMarkets(communityIds[1]);
        address[] memory existingMarkets3 = hub.getCommunityMarkets(communityIds[2]);
        
        // Sports Markets (Community 1) - need 2 markets
        if (existingMarkets1.length >= 2) {
            markets[0] = existingMarkets1[0];
            markets[1] = existingMarkets1[1];
            console.log("[SKIP] Sports markets already exist");
        } else {
            if (existingMarkets1.length == 0) {
                vm.broadcast(creator1PK);
                markets[0] = hub.createMarket(
                    communityIds[0],
                    "polymarket-champions-league-final",
                    "Champions League Final 2024: Will Real Madrid win?",
                    baseDeadline
                );
                console.log("[OK] Created: Champions League market");
            } else {
                markets[0] = existingMarkets1[0];
            }
            
            if (existingMarkets1.length < 2) {
                vm.broadcast(creator1PK);
                markets[1] = hub.createMarket(
                    communityIds[0],
                    "polymarket-nba-finals",
                    "NBA Finals: Will Lakers win the championship?",
                    baseDeadline + 14 days
                );
                console.log("[OK] Created: NBA Finals market");
            } else {
                markets[1] = existingMarkets1[1];
            }
        }
        
        // Crypto Markets (Community 2) - need 2 markets
        if (existingMarkets2.length >= 2) {
            markets[2] = existingMarkets2[0];
            markets[3] = existingMarkets2[1];
            console.log("[SKIP] Crypto markets already exist");
        } else {
            if (existingMarkets2.length == 0) {
                vm.broadcast(creator2PK);
                markets[2] = hub.createMarket(
                    communityIds[1],
                    "polymarket-btc-100k",
                    "Will Bitcoin reach $100,000 by end of 2024?",
                    baseDeadline + 1 days
                );
                console.log("[OK] Created: Bitcoin $100k market");
            } else {
                markets[2] = existingMarkets2[0];
            }
            
            if (existingMarkets2.length < 2) {
                vm.broadcast(creator2PK);
                markets[3] = hub.createMarket(
                    communityIds[1],
                    "polymarket-eth-etf",
                    "Will Ethereum ETF be approved by SEC?",
                    baseDeadline + 21 days
                );
                console.log("[OK] Created: ETH ETF market");
            } else {
                markets[3] = existingMarkets2[1];
            }
        }
        
        // Politics Markets (Community 3) - need 2 markets
        if (existingMarkets3.length >= 2) {
            markets[4] = existingMarkets3[0];
            markets[5] = existingMarkets3[1];
            console.log("[SKIP] Politics markets already exist");
        } else {
            if (existingMarkets3.length == 0) {
                vm.broadcast(creator3PK);
                markets[4] = hub.createMarket(
                    communityIds[2],
                    "polymarket-us-elections",
                    "US Presidential Election 2024: Outcome prediction",
                    baseDeadline
                );
                console.log("[OK] Created: US Elections market");
            } else {
                markets[4] = existingMarkets3[0];
            }
            
            if (existingMarkets3.length < 2) {
                vm.broadcast(creator3PK);
                markets[5] = hub.createMarket(
                    communityIds[2],
                    "polymarket-policy-decision",
                    "Will new climate policy pass congress?",
                    baseDeadline + 1 days
                );
                console.log("[OK] Created: Climate Policy market");
            } else {
                markets[5] = existingMarkets3[1];
            }
        }
        
        return markets;
    }
    
    function _stakeInMarkets(address[] memory markets) internal {
        // Sports market 1: Multiple users stake
        Market market1 = Market(payable(markets[0]));
        
        vm.broadcast(user1PK);
        market1.stake{value: 0.1 ether}(Market.Outcome.A);
        console.log("[OK] User 1 staked 0.1 CHZ on Outcome A (Champions League)");
        
        vm.broadcast(user2PK);
        market1.stake{value: 0.05 ether}(Market.Outcome.B);
        console.log("[OK] User 2 staked 0.05 CHZ on Outcome B");
        
        vm.broadcast(user3PK);
        market1.stake{value: 0.03 ether}(Market.Outcome.A);
        console.log("[OK] User 3 staked 0.03 CHZ on Outcome A");
        
        // Crypto market: BTC $100k
        Market market3 = Market(payable(markets[2]));
        
        vm.broadcast(user1PK);
        market3.stake{value: 0.15 ether}(Market.Outcome.A);
        console.log("[OK] User 1 staked 0.15 CHZ on BTC $100k (Yes)");
        
        vm.broadcast(user2PK);
        market3.stake{value: 0.1 ether}(Market.Outcome.B);
        console.log("[OK] User 2 staked 0.1 CHZ on BTC $100k (No)");
        
        vm.broadcast(user4PK);
        market3.stake{value: 0.08 ether}(Market.Outcome.A);
        console.log("[OK] User 4 staked 0.08 CHZ on BTC $100k (Yes)");
        
        // Politics market
        Market market5 = Market(payable(markets[4]));
        
        vm.broadcast(user5PK);
        market5.stake{value: 0.05 ether}(Market.Outcome.B);
        console.log("[OK] User 5 staked 0.05 CHZ on US Elections (Outcome B)");
    }
    
    function _createAndCompleteMarkets(uint256[] memory communityIds) internal {
        // Create a market that will be completed immediately
        console.log("\nCreating completed market example...");
        
        uint256 shortDeadline = block.timestamp + 1 hours;
        
        vm.broadcast(creator1PK);
        address completedMarket = hub.createMarket(
            communityIds[0],
            "polymarket-test-completed",
            "Test Market: Will outcome A win? (Completed)",
            shortDeadline
        );
        console.log("[OK] Created test market:", completedMarket);
        
        Market market = Market(payable(completedMarket));
        
        // Users stake
        vm.broadcast(user1PK);
        market.stake{value: 0.1 ether}(Market.Outcome.A);
        console.log("[OK] User 1 staked on Outcome A");
        
        vm.broadcast(user2PK);
        market.stake{value: 0.05 ether}(Market.Outcome.B);
        console.log("[OK] User 2 staked on Outcome B");
        
        // Creator triggers execution
        vm.broadcast(creator1PK);
        market.triggerExecution(Market.Outcome.A);
        console.log("[OK] Creator chose Outcome A");
        
        // Simulate return and settlement
        vm.broadcast(creator1PK);
        market.mockPolymarketReturn{value: 0.15 ether}(Market.Outcome.A, 0.15 ether);
        console.log("[OK] Market settled: Outcome A won with 0.15 CHZ payout");
        
        // Winner claims
        vm.broadcast(user1PK);
        market.claim();
        console.log("[OK] User 1 claimed rewards!");
    }
    
    function _printSummary() internal view {
        (
            uint256 totalCreators,
            uint256 totalMarkets,
            uint256 totalCommunities,
            uint256 tvl
        ) = hub.getHubStats();
        
        console.log("Total Creators:", totalCreators);
        console.log("Total Communities:", totalCommunities);
        console.log("Total Markets:", totalMarkets);
        console.log("Total Value Locked:", tvl / 1 ether, "CHZ");
        
        console.log("\nSeeding completed successfully!");
        console.log("\nContract Address:", address(hub));
        console.log("\nYour platform now has:");
        console.log("  - 3 creators with different specialties");
        console.log("  - 3 active communities");
        console.log("  - 7 markets (6 active + 1 completed)");
        console.log("  - 5 users participating");
        console.log("  - Real stakes and TVL");
    }
}

