// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PredictionHub.sol";
import "../src/NetworkConfig.sol";
import "../src/MockPolymarket.sol";
import "../src/Market.sol";

/**
 * @title Integration Test
 * @notice End-to-end integration test demonstrating the complete platform flow
 */
contract IntegrationTest is Test {
    PredictionHub public hub;
    NetworkConfig public networkConfig;
    MockPolymarket public mockPolymarket;
    
    address public creator = address(0x1);
    address public alice = address(0x2);
    address public bob = address(0x3);
    address public charlie = address(0x4);
    
    function setUp() public {
        // Deploy the entire platform
        networkConfig = new NetworkConfig();
        mockPolymarket = new MockPolymarket();
        hub = new PredictionHub(address(networkConfig));
        
        // Fund accounts
        vm.deal(creator, 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);
    }
    
    /**
     * @notice Complete happy path: Creator wins scenario
     */
    function testCompleteFlowCreatorWins() public {
        // === PHASE 1: CREATOR SETUP ===
        console.log("\n=== Phase 1: Creator Registration ===");
        vm.prank(creator);
        hub.registerCreator("Elite Sports Bettor", "ipfs://creator-profile");
        
        (string memory name, , uint256 marketCount,) = hub.getCreatorProfile(creator);
        assertEq(name, "Elite Sports Bettor");
        assertEq(marketCount, 0);
        console.log("Creator registered:", name);
        
        // === PHASE 1.5: COMMUNITY CREATION ===
        console.log("\n=== Phase 1.5: Community Creation ===");
        vm.prank(creator);
        uint256 communityId = hub.createCommunity(
            "Sports Betting Community",
            "Community for sports predictions",
            "ipfs://community-profile"
        );
        console.log("Community created with ID:", communityId);
        
        // Users join the community
        vm.prank(alice);
        hub.joinCommunity(communityId);
        console.log("Alice joined the community");
        
        vm.prank(bob);
        hub.joinCommunity(communityId);
        console.log("Bob joined the community");
        
        vm.prank(charlie);
        hub.joinCommunity(communityId);
        console.log("Charlie joined the community");
        
        // === PHASE 2: MARKET CREATION ===
        console.log("\n=== Phase 2: Market Creation ===");
        vm.prank(creator);
        address marketAddr = hub.createMarket(
            communityId,
            "polymarket-football-match-123",
            "Champions League Final: Will Real Madrid win?",
            block.timestamp + 7 days
        );
        
        Market market = Market(payable(marketAddr));
        console.log("Market created at:", marketAddr);
        console.log("Market question:", market.metadata());
        
        // === PHASE 3: COMMUNITY STAKING ===
        console.log("\n=== Phase 3: Community Staking ===");
        
        // Alice stakes 5 ETH on Team A (Real Madrid wins)
        vm.prank(alice);
        market.stake{value: 5 ether}(Market.Outcome.A);
        console.log("Alice staked 5 ETH on Outcome A");
        
        // Bob stakes 3 ETH on Team B (Opponent wins)
        vm.prank(bob);
        market.stake{value: 3 ether}(Market.Outcome.B);
        console.log("Bob staked 3 ETH on Outcome B");
        
        // Charlie stakes 2 ETH on Draw
        vm.prank(charlie);
        market.stake{value: 2 ether}(Market.Outcome.Draw);
        console.log("Charlie staked 2 ETH on Draw");
        
        // Check pool status
        (uint256 poolA, uint256 poolB, uint256 poolDraw) = market.getPoolInfo();
        console.log("\nPool Status:");
        console.log("- Outcome A:", poolA / 1 ether, "ETH");
        console.log("- Outcome B:", poolB / 1 ether, "ETH");
        console.log("- Draw:", poolDraw / 1 ether, "ETH");
        console.log("- Total:", market.getTotalPool() / 1 ether, "ETH");
        
        assertEq(market.getTotalPool(), 10 ether);
        
        // === PHASE 4: CREATOR TRIGGERS ===
        console.log("\n=== Phase 4: Creator Triggers Execution ===");
        
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A); // Creator bets on Team A
        console.log("Creator chose Outcome A (Real Madrid wins)");
        console.log("Market state:", uint(market.state())); // Should be MockTrading
        
        assertEq(uint(market.state()), uint(Market.MarketState.MockTrading));
        assertTrue(market.outcomeChosen());
        
        // === PHASE 5: MARKET RESOLUTION ===
        console.log("\n=== Phase 5: Market Resolution ===");
        
        // Simulate Real Madrid winning (Outcome A)
        // In real scenario, this would be done by Chainlink CRE after Polymarket resolves
        uint256 winnings = 15 ether; // 50% profit
        vm.deal(address(this), winnings);
        
        vm.prank(creator);
        market.mockPolymarketReturn{value: winnings}(Market.Outcome.A, winnings);
        console.log("Market resolved: Outcome A won!");
        console.log("Total payout:", winnings / 1 ether, "ETH");
        
        assertTrue(market.isSettled());
        assertEq(uint(market.state()), uint(Market.MarketState.Settled));
        
        // === PHASE 6: WINNER CLAIMS ===
        console.log("\n=== Phase 6: Winner Claims ===");
        
        // Alice should win (staked on A, creator chose A, A won)
        assertTrue(market.canClaim(alice));
        uint256 alicePotential = market.getPotentialReward(alice);
        console.log("Alice can claim:", alicePotential / 1 ether, "ETH");
        
        uint256 aliceBalanceBefore = alice.balance;
        vm.prank(alice);
        market.claim();
        uint256 aliceBalanceAfter = alice.balance;
        
        uint256 aliceReward = aliceBalanceAfter - aliceBalanceBefore;
        console.log("Alice claimed:", aliceReward / 1 ether, "ETH");
        
        // Alice should get 100% of payout (she was the only one on outcome A)
        assertEq(aliceReward, 15 ether);
        
        // Bob and Charlie should NOT be able to claim
        assertFalse(market.canClaim(bob));
        assertFalse(market.canClaim(charlie));
        console.log("Bob cannot claim (staked on B)");
        console.log("Charlie cannot claim (staked on Draw)");
        
        // === PHASE 7: PLATFORM STATS ===
        console.log("\n=== Phase 7: Platform Statistics ===");
        (uint256 totalCreators, uint256 totalMarkets, uint256 totalCommunities, uint256 tvl) = hub.getHubStats();
        console.log("Total Creators:", totalCreators);
        console.log("Total Markets:", totalMarkets);
        console.log("Total Communities:", totalCommunities);
        console.log("TVL:", tvl / 1 ether, "ETH");
        
        assertEq(totalCreators, 1);
        assertEq(totalMarkets, 1);
        assertEq(totalCommunities, 1);
    }
    
    /**
     * @notice Scenario where creator chooses wrong and users lose
     */
    function testCompleteFlowCreatorLoses() public {
        // Setup
        vm.prank(creator);
        hub.registerCreator("Crypto Analyst", "ipfs://analyst");
        
        vm.prank(creator);
        uint256 communityId = hub.createCommunity("Crypto Community", "Crypto predictions", "ipfs://crypto");
        
        vm.prank(alice);
        hub.joinCommunity(communityId);
        
        vm.prank(bob);
        hub.joinCommunity(communityId);
        
        vm.prank(creator);
        address marketAddr = hub.createMarket(
            communityId,
            "polymarket-btc-price",
            "Will BTC reach $100k?",
            block.timestamp + 30 days
        );
        Market market = Market(payable(marketAddr));
        
        // Users stake
        vm.prank(alice);
        market.stake{value: 4 ether}(Market.Outcome.A); // Yes
        
        vm.prank(bob);
        market.stake{value: 6 ether}(Market.Outcome.B); // No
        
        // Creator chooses YES (Outcome A)
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A);
        
        // But NO wins (Outcome B)
        uint256 payout = 0; // Lost the bet
        vm.prank(creator);
        market.mockPolymarketReturn(Market.Outcome.B, payout);
        
        // Nobody can claim (creator chose A but B won)
        assertFalse(market.canClaim(alice));
        assertFalse(market.canClaim(bob));
        
        console.log("\nCreator chose wrong - all users lose their stakes");
        console.log("This is expected behavior: users bet WITH the creator");
    }
    
    /**
     * @notice Multiple markets, multiple creators
     */
    function testMultipleMarketsAndCreators() public {
        address creator2 = address(0x5);
        vm.deal(creator2, 100 ether);
        
        // Register two creators
        vm.prank(creator);
        hub.registerCreator("Creator One", "ipfs://c1");
        
        vm.prank(creator2);
        hub.registerCreator("Creator Two", "ipfs://c2");
        
        // Create communities
        vm.prank(creator);
        uint256 communityId1 = hub.createCommunity("Community 1", "Description", "ipfs://c1");
        
        vm.prank(creator2);
        uint256 communityId2 = hub.createCommunity("Community 2", "Description", "ipfs://c2");
        
        // Each creates a market
        vm.prank(creator);
        address market1 = hub.createMarket(communityId1, "pm-1", "Market 1", block.timestamp + 7 days);
        
        vm.prank(creator2);
        address market2 = hub.createMarket(communityId2, "pm-2", "Market 2", block.timestamp + 7 days);
        
        // Verify separation
        address[] memory creator1Markets = hub.getCreatorMarkets(creator);
        address[] memory creator2Markets = hub.getCreatorMarkets(creator2);
        
        assertEq(creator1Markets.length, 1);
        assertEq(creator2Markets.length, 1);
        assertEq(creator1Markets[0], market1);
        assertEq(creator2Markets[0], market2);
        
        // Both markets are active
        address[] memory activeMarkets = hub.getActiveMarkets();
        assertEq(activeMarkets.length, 2);
        
        console.log("\nMultiple creators can operate independently");
        console.log("Creator 1 markets:", creator1Markets.length);
        console.log("Creator 2 markets:", creator2Markets.length);
    }
    
    /**
     * @notice Draw outcome scenario
     */
    function testDrawOutcome() public {
        vm.prank(creator);
        hub.registerCreator("Sports Expert", "ipfs://sports");
        
        vm.prank(creator);
        uint256 communityId = hub.createCommunity("Sports Community", "Description", "ipfs://sports");
        
        // Users join community
        vm.prank(alice);
        hub.joinCommunity(communityId);
        
        vm.prank(bob);
        hub.joinCommunity(communityId);
        
        vm.prank(charlie);
        hub.joinCommunity(communityId);
        
        vm.prank(creator);
        address marketAddr = hub.createMarket(
            communityId,
            "polymarket-soccer",
            "Soccer Match: Team A vs Team B",
            block.timestamp + 3 days
        );
        Market market = Market(payable(marketAddr));
        
        // Stake on different outcomes
        vm.prank(alice);
        market.stake{value: 2 ether}(Market.Outcome.A);
        
        vm.prank(bob);
        market.stake{value: 3 ether}(Market.Outcome.Draw);
        
        vm.prank(charlie);
        market.stake{value: 1 ether}(Market.Outcome.B);
        
        // Creator predicts Draw
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.Draw);
        
        // Match ends in a Draw
        uint256 payout = 8 ether;
        vm.deal(address(this), payout);
        vm.prank(creator);
        market.mockPolymarketReturn{value: payout}(Market.Outcome.Draw, payout);
        
        // Only Bob can claim (staked on Draw)
        assertTrue(market.canClaim(bob));
        assertFalse(market.canClaim(alice));
        assertFalse(market.canClaim(charlie));
        
        uint256 bobBefore = bob.balance;
        vm.prank(bob);
        market.claim();
        uint256 bobReward = bob.balance - bobBefore;
        
        assertEq(bobReward, 8 ether); // Gets full payout (only one on Draw)
        
        console.log("\nDraw outcome works correctly");
        console.log("Bob (Draw bettor) won:", bobReward / 1 ether, "ETH");
    }
    
    receive() external payable {}
}

