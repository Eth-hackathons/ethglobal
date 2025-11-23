// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Market.sol";
import "../src/PredictionHub.sol";
import "../src/NetworkConfig.sol";
import "../src/MockPolymarket.sol";

contract MarketTest is Test {
    PredictionHub public hub;
    NetworkConfig public networkConfig;
    MockPolymarket public mockPolymarket;
    Market public market;
    
    address public creator = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    
    uint256 constant INITIAL_BALANCE = 100 ether;
    
    function setUp() public {
        // Deploy contracts
        networkConfig = new NetworkConfig();
        mockPolymarket = new MockPolymarket();
        hub = new PredictionHub(address(networkConfig));
        
        // Fund test accounts
        vm.deal(creator, INITIAL_BALANCE);
        vm.deal(user1, INITIAL_BALANCE);
        vm.deal(user2, INITIAL_BALANCE);
        vm.deal(user3, INITIAL_BALANCE);
        
        // Register creator
        vm.prank(creator);
        hub.registerCreator("Test Creator", "ipfs://test");
        
        // Create community
        vm.prank(creator);
        uint256 communityId = hub.createCommunity("Test Community", "Test Description", "ipfs://community");
        
        // Create market
        vm.prank(creator);
        address marketAddress = hub.createMarket(
            communityId,
            "polymarket-123",
            "Will ETH reach $5k?",
            block.timestamp + 7 days
        );
        market = Market(payable(marketAddress));
        
        // Users join community to be able to stake
        vm.prank(user1);
        hub.joinCommunity(communityId);
        
        vm.prank(user2);
        hub.joinCommunity(communityId);
        
        vm.prank(user3);
        hub.joinCommunity(communityId);
    }
    
    function testInitialState() public view {
        assertEq(market.creator(), creator);
        assertEq(market.hub(), address(hub));
        assertEq(uint(market.state()), uint(Market.MarketState.Open));
        assertFalse(market.outcomeChosen());
        assertFalse(market.isSettled());
    }
    
    function testStakeOutcomeA() public {
        vm.prank(user1);
        market.stake{value: 1 ether}(Market.Outcome.A);
        
        assertEq(market.getStake(user1, Market.Outcome.A), 1 ether);
        (uint256 totalA, uint256 totalB, uint256 totalDraw) = market.getPoolInfo();
        assertEq(totalA, 1 ether);
        assertEq(totalB, 0);
        assertEq(totalDraw, 0);
    }
    
    function testStakeAllOutcomes() public {
        vm.prank(user1);
        market.stake{value: 1 ether}(Market.Outcome.A);
        
        vm.prank(user2);
        market.stake{value: 2 ether}(Market.Outcome.B);
        
        vm.prank(user3);
        market.stake{value: 0.5 ether}(Market.Outcome.Draw);
        
        (uint256 totalA, uint256 totalB, uint256 totalDraw) = market.getPoolInfo();
        assertEq(totalA, 1 ether);
        assertEq(totalB, 2 ether);
        assertEq(totalDraw, 0.5 ether);
        assertEq(market.getTotalPool(), 3.5 ether);
    }
    
    function testMultipleStakesFromSameUser() public {
        vm.startPrank(user1);
        market.stake{value: 1 ether}(Market.Outcome.A);
        market.stake{value: 0.5 ether}(Market.Outcome.A);
        vm.stopPrank();
        
        assertEq(market.getStake(user1, Market.Outcome.A), 1.5 ether);
    }
    
    function testCannotStakeZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert("Market: must stake non-zero amount");
        market.stake{value: 0}(Market.Outcome.A);
    }
    
    function testCannotStakeAfterDeadline() public {
        // Fast forward past deadline
        vm.warp(block.timestamp + 8 days);
        
        vm.prank(user1);
        vm.expectRevert("Market: staking period ended");
        market.stake{value: 1 ether}(Market.Outcome.A);
    }
    
    function testTriggerExecution() public {
        // Users stake
        vm.prank(user1);
        market.stake{value: 2 ether}(Market.Outcome.A);
        
        vm.prank(user2);
        market.stake{value: 3 ether}(Market.Outcome.B);
        
        // Creator triggers with outcome A
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A);
        
        assertEq(uint(market.chosenOutcome()), uint(Market.Outcome.A));
        assertTrue(market.outcomeChosen());
        assertEq(uint(market.state()), uint(Market.MarketState.MockTrading));
    }
    
    function testOnlyCreatorCanTrigger() public {
        vm.prank(user1);
        market.stake{value: 1 ether}(Market.Outcome.A);
        
        vm.prank(user1);
        vm.expectRevert("Market: caller is not creator");
        market.triggerExecution(Market.Outcome.A);
    }
    
    function testCannotTriggerWithoutStakes() public {
        vm.prank(creator);
        vm.expectRevert("Market: no stakes");
        market.triggerExecution(Market.Outcome.A);
    }
    
    function testMockPolymarketReturn() public {
        // Setup: stake and trigger
        vm.prank(user1);
        market.stake{value: 5 ether}(Market.Outcome.A);
        
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A);
        
        // Simulate Polymarket return
        uint256 payout = 10 ether; // 2x return
        vm.deal(address(this), payout);
        
        vm.prank(creator);
        market.mockPolymarketReturn{value: payout}(Market.Outcome.A, payout);
        
        assertTrue(market.isSettled());
        assertEq(uint(market.state()), uint(Market.MarketState.Settled));
        assertEq(uint(market.winningOutcome()), uint(Market.Outcome.A));
        assertEq(market.totalPayout(), payout);
    }
    
    function testWinnerClaim() public {
        // Setup
        vm.prank(user1);
        market.stake{value: 3 ether}(Market.Outcome.A);
        
        vm.prank(user2);
        market.stake{value: 2 ether}(Market.Outcome.A);
        
        vm.prank(user3);
        market.stake{value: 5 ether}(Market.Outcome.B);
        
        // Creator chooses A
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A);
        
        // Outcome A wins, return 12 ether (higher than initial 10 ether pool)
        uint256 payout = 12 ether;
        vm.deal(address(this), payout);
        
        vm.prank(creator);
        market.mockPolymarketReturn{value: payout}(Market.Outcome.A, payout);
        
        // User1 claims (staked 3 out of 5 ether on winning side)
        uint256 user1BalanceBefore = user1.balance;
        vm.prank(user1);
        market.claim();
        uint256 user1BalanceAfter = user1.balance;
        
        // User1 should receive 3/5 of 12 ether = 7.2 ether
        uint256 expectedReward = (3 ether * payout) / 5 ether;
        assertEq(user1BalanceAfter - user1BalanceBefore, expectedReward);
        assertTrue(market.hasClaimed(user1));
    }
    
    function testProportionalRewardDistribution() public {
        // User1 stakes 2 ether, User2 stakes 8 ether on outcome A
        vm.prank(user1);
        market.stake{value: 2 ether}(Market.Outcome.A);
        
        vm.prank(user2);
        market.stake{value: 8 ether}(Market.Outcome.A);
        
        // Creator chooses A and it wins
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A);
        
        uint256 payout = 20 ether;
        vm.deal(address(this), payout);
        vm.prank(creator);
        market.mockPolymarketReturn{value: payout}(Market.Outcome.A, payout);
        
        // User1 should get 20% (2/10), User2 should get 80% (8/10)
        uint256 user1Before = user1.balance;
        vm.prank(user1);
        market.claim();
        assertEq(user1.balance - user1Before, 4 ether);
        
        uint256 user2Before = user2.balance;
        vm.prank(user2);
        market.claim();
        assertEq(user2.balance - user2Before, 16 ether);
    }
    
    function testCannotClaimTwice() public {
        vm.prank(user1);
        market.stake{value: 1 ether}(Market.Outcome.A);
        
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A);
        
        uint256 payout = 2 ether;
        vm.deal(address(this), payout);
        vm.prank(creator);
        market.mockPolymarketReturn{value: payout}(Market.Outcome.A, payout);
        
        vm.prank(user1);
        market.claim();
        
        vm.prank(user1);
        vm.expectRevert("Market: already claimed");
        market.claim();
    }
    
    function testLoserCannotClaim() public {
        vm.prank(user1);
        market.stake{value: 3 ether}(Market.Outcome.A);
        
        vm.prank(user2);
        market.stake{value: 2 ether}(Market.Outcome.B);
        
        // Creator chooses A, but B wins
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A);
        
        uint256 payout = 0; // Lost, so no payout
        vm.prank(creator);
        market.mockPolymarketReturn(Market.Outcome.B, payout);
        
        // User1 staked on A (creator's choice) but B won
        vm.prank(user1);
        vm.expectRevert("Market: chosen outcome did not win");
        market.claim();
    }
    
    function testUserNotOnWinningSideCannotClaim() public {
        vm.prank(user1);
        market.stake{value: 3 ether}(Market.Outcome.A);
        
        vm.prank(user2);
        market.stake{value: 2 ether}(Market.Outcome.B);
        
        // Creator chooses A and it wins
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A);
        
        uint256 payout = 6 ether;
        vm.deal(address(this), payout);
        vm.prank(creator);
        market.mockPolymarketReturn{value: payout}(Market.Outcome.A, payout);
        
        // User2 staked on B, but creator chose A (which won)
        vm.prank(user2);
        vm.expectRevert("Market: no stake on winning outcome");
        market.claim();
    }
    
    function testDrawOutcome() public {
        vm.prank(user1);
        market.stake{value: 1 ether}(Market.Outcome.A);
        
        vm.prank(user2);
        market.stake{value: 2 ether}(Market.Outcome.Draw);
        
        vm.prank(user3);
        market.stake{value: 1.5 ether}(Market.Outcome.B);
        
        // Creator chooses Draw and it wins
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.Draw);
        
        uint256 payout = 4 ether;
        vm.deal(address(this), payout);
        vm.prank(creator);
        market.mockPolymarketReturn{value: payout}(Market.Outcome.Draw, payout);
        
        // Only user2 can claim (staked on Draw)
        uint256 user2Before = user2.balance;
        vm.prank(user2);
        market.claim();
        assertEq(user2.balance - user2Before, 4 ether);
        
        // Others cannot claim
        vm.prank(user1);
        vm.expectRevert("Market: no stake on winning outcome");
        market.claim();
    }
    
    function testGetPotentialReward() public {
        vm.prank(user1);
        market.stake{value: 3 ether}(Market.Outcome.A);
        
        vm.prank(user2);
        market.stake{value: 7 ether}(Market.Outcome.A);
        
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A);
        
        uint256 payout = 20 ether;
        vm.deal(address(this), payout);
        vm.prank(creator);
        market.mockPolymarketReturn{value: payout}(Market.Outcome.A, payout);
        
        // User1 should get 30% of payout (3/10)
        assertEq(market.getPotentialReward(user1), 6 ether);
        // User2 should get 70% of payout (7/10)
        assertEq(market.getPotentialReward(user2), 14 ether);
    }
    
    function testCanClaim() public {
        vm.prank(user1);
        market.stake{value: 1 ether}(Market.Outcome.A);
        
        assertFalse(market.canClaim(user1)); // Not settled yet
        
        vm.prank(creator);
        market.triggerExecution(Market.Outcome.A);
        
        assertFalse(market.canClaim(user1)); // Still not settled
        
        uint256 payout = 2 ether;
        vm.deal(address(this), payout);
        vm.prank(creator);
        market.mockPolymarketReturn{value: payout}(Market.Outcome.A, payout);
        
        assertTrue(market.canClaim(user1)); // Now can claim
        
        vm.prank(user1);
        market.claim();
        
        assertFalse(market.canClaim(user1)); // Already claimed
    }
    
    function testGetMarketSummary() public {
        vm.prank(user1);
        market.stake{value: 1 ether}(Market.Outcome.A);
        
        vm.prank(user2);
        market.stake{value: 2 ether}(Market.Outcome.B);
        
        (
            Market.MarketState currentState,
            uint256 totalPool,
            uint256 stakeA,
            uint256 stakeB,
            uint256 stakeDraw,
            bool hasChosenOutcome,
            Market.Outcome chosen,
            bool settled,
            Market.Outcome winner
        ) = market.getMarketSummary();
        
        assertEq(uint(currentState), uint(Market.MarketState.Open));
        assertEq(totalPool, 3 ether);
        assertEq(stakeA, 1 ether);
        assertEq(stakeB, 2 ether);
        assertEq(stakeDraw, 0);
        assertFalse(hasChosenOutcome);
        assertFalse(settled);
    }
    
    receive() external payable {}
}

