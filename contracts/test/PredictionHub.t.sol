// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PredictionHub.sol";
import "../src/NetworkConfig.sol";
import "../src/Market.sol";

contract PredictionHubTest is Test {
    PredictionHub public hub;
    NetworkConfig public networkConfig;
    
    address public owner = address(this);
    address public creator1 = address(0x1);
    address public creator2 = address(0x2);
    address public user = address(0x3);
    
    uint256 constant INITIAL_BALANCE = 100 ether;
    
    function setUp() public {
        // Deploy contracts
        networkConfig = new NetworkConfig();
        hub = new PredictionHub(address(networkConfig));
        
        // Fund accounts
        vm.deal(creator1, INITIAL_BALANCE);
        vm.deal(creator2, INITIAL_BALANCE);
        vm.deal(user, INITIAL_BALANCE);
    }
    
    function testInitialState() public view {
        assertEq(hub.owner(), owner);
        assertEq(address(hub.networkConfig()), address(networkConfig));
        assertEq(hub.marketCount(), 0);
    }
    
    function testRegisterCreator() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        assertTrue(hub.isCreator(creator1));
        
        (
            string memory name,
            string memory metadataURI,
            uint256 marketCountValue,
            uint256 registeredAt
        ) = hub.getCreatorProfile(creator1);
        
        assertEq(name, "Creator One");
        assertEq(metadataURI, "ipfs://creator1");
        assertEq(marketCountValue, 0);
        assertGt(registeredAt, 0);
    }
    
    function testCannotRegisterTwice() public {
        vm.startPrank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        vm.expectRevert("PredictionHub: already registered");
        hub.registerCreator("Creator One Again", "ipfs://creator1-new");
        vm.stopPrank();
    }
    
    function testCannotRegisterWithEmptyName() public {
        vm.prank(creator1);
        vm.expectRevert("PredictionHub: name cannot be empty");
        hub.registerCreator("", "ipfs://creator1");
    }
    
    function testCreateMarket() public {
        // Register creator
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        // Create market
        uint256 deadline = block.timestamp + 7 days;
        vm.prank(creator1);
        address marketAddress = hub.createMarket(
            "polymarket-123",
            "Will ETH reach $5k?",
            deadline
        );
        
        assertTrue(marketAddress != address(0));
        assertTrue(hub.isMarket(marketAddress));
        assertEq(hub.marketCount(), 1);
        
        // Verify market details
        Market market = Market(payable(marketAddress));
        assertEq(market.creator(), creator1);
        assertEq(market.hub(), address(hub));
        assertEq(market.polymarketId(), "polymarket-123");
    }
    
    function testOnlyRegisteredCreatorCanCreateMarket() public {
        uint256 deadline = block.timestamp + 7 days;
        
        vm.prank(user);
        vm.expectRevert("PredictionHub: not a registered creator");
        hub.createMarket(
            "polymarket-123",
            "Will ETH reach $5k?",
            deadline
        );
    }
    
    function testCannotCreateMarketWithInvalidPolymarketId() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        uint256 deadline = block.timestamp + 7 days;
        vm.prank(creator1);
        vm.expectRevert("PredictionHub: invalid polymarket ID");
        hub.createMarket("", "metadata", deadline);
    }
    
    function testCannotCreateMarketWithPastDeadline() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        uint256 pastDeadline = 1; // Clearly in the past
        vm.prank(creator1);
        vm.expectRevert("PredictionHub: invalid deadline");
        hub.createMarket("polymarket-123", "metadata", pastDeadline);
    }
    
    function testCannotCreateMarketWithTooLongDuration() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        NetworkConfig.ChainConfig memory config = networkConfig.getActiveConfig();
        uint256 tooLongDeadline = block.timestamp + config.maxStakingDuration + 1 days;
        
        vm.prank(creator1);
        vm.expectRevert("PredictionHub: staking period too long");
        hub.createMarket("polymarket-123", "metadata", tooLongDeadline);
    }
    
    function testGetCreatorMarkets() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        // Create multiple markets
        vm.startPrank(creator1);
        address market1 = hub.createMarket("pm-1", "Market 1", block.timestamp + 7 days);
        address market2 = hub.createMarket("pm-2", "Market 2", block.timestamp + 14 days);
        address market3 = hub.createMarket("pm-3", "Market 3", block.timestamp + 21 days);
        vm.stopPrank();
        
        address[] memory markets = hub.getCreatorMarkets(creator1);
        assertEq(markets.length, 3);
        assertEq(markets[0], market1);
        assertEq(markets[1], market2);
        assertEq(markets[2], market3);
    }
    
    function testMultipleCreators() public {
        // Register multiple creators
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        vm.prank(creator2);
        hub.registerCreator("Creator Two", "ipfs://creator2");
        
        address[] memory creators = hub.getAllCreators();
        assertEq(creators.length, 2);
        assertTrue(hub.isCreator(creator1));
        assertTrue(hub.isCreator(creator2));
    }
    
    function testCreatorMarketCount() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        (,,uint256 marketCountBefore,) = hub.getCreatorProfile(creator1);
        assertEq(marketCountBefore, 0);
        
        vm.prank(creator1);
        hub.createMarket("pm-1", "Market 1", block.timestamp + 7 days);
        
        (,,uint256 marketCountAfter,) = hub.getCreatorProfile(creator1);
        assertEq(marketCountAfter, 1);
    }
    
    function testGetAllMarkets() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        vm.prank(creator2);
        hub.registerCreator("Creator Two", "ipfs://creator2");
        
        vm.prank(creator1);
        address market1 = hub.createMarket("pm-1", "Market 1", block.timestamp + 7 days);
        
        vm.prank(creator2);
        address market2 = hub.createMarket("pm-2", "Market 2", block.timestamp + 14 days);
        
        address[] memory allMarkets = hub.getAllMarkets();
        assertEq(allMarkets.length, 2);
        assertEq(allMarkets[0], market1);
        assertEq(allMarkets[1], market2);
    }
    
    function testGetActiveMarkets() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        // Create two markets
        vm.startPrank(creator1);
        address market1Addr = hub.createMarket("pm-1", "Market 1", block.timestamp + 7 days);
        address market2Addr = hub.createMarket("pm-2", "Market 2", block.timestamp + 14 days);
        vm.stopPrank();
        
        // Both should be active initially
        address[] memory activeMarkets = hub.getActiveMarkets();
        assertEq(activeMarkets.length, 2);
        
        // Lock one market
        Market market1 = Market(payable(market1Addr));
        vm.deal(user, 10 ether);
        vm.prank(user);
        market1.stake{value: 1 ether}(Market.Outcome.A);
        
        vm.prank(creator1);
        market1.triggerExecution(Market.Outcome.A);
        
        // Only one should be active now
        activeMarkets = hub.getActiveMarkets();
        assertEq(activeMarkets.length, 1);
        assertEq(activeMarkets[0], market2Addr);
    }
    
    function testGetMarketsByState() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        vm.startPrank(creator1);
        address market1Addr = hub.createMarket("pm-1", "Market 1", block.timestamp + 7 days);
        address market2Addr = hub.createMarket("pm-2", "Market 2", block.timestamp + 14 days);
        vm.stopPrank();
        
        // Both in Open state
        address[] memory openMarkets = hub.getMarketsByState(Market.MarketState.Open);
        assertEq(openMarkets.length, 2);
        
        // Trigger one
        Market market1 = Market(payable(market1Addr));
        vm.deal(user, 10 ether);
        vm.prank(user);
        market1.stake{value: 1 ether}(Market.Outcome.A);
        
        vm.prank(creator1);
        market1.triggerExecution(Market.Outcome.A);
        
        // Check states
        openMarkets = hub.getMarketsByState(Market.MarketState.Open);
        assertEq(openMarkets.length, 1);
        assertEq(openMarkets[0], market2Addr);
        
        address[] memory tradingMarkets = hub.getMarketsByState(Market.MarketState.MockTrading);
        assertEq(tradingMarkets.length, 1);
        assertEq(tradingMarkets[0], market1Addr);
    }
    
    function testGetTotalValueLocked() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        vm.startPrank(creator1);
        address market1Addr = hub.createMarket("pm-1", "Market 1", block.timestamp + 7 days);
        address market2Addr = hub.createMarket("pm-2", "Market 2", block.timestamp + 14 days);
        vm.stopPrank();
        
        assertEq(hub.getTotalValueLocked(), 0);
        
        // Stake in markets
        vm.deal(user, 10 ether);
        vm.prank(user);
        Market(payable(market1Addr)).stake{value: 2 ether}(Market.Outcome.A);
        
        vm.prank(user);
        Market(payable(market2Addr)).stake{value: 3 ether}(Market.Outcome.B);
        
        assertEq(hub.getTotalValueLocked(), 5 ether);
    }
    
    function testUpdateCreatorMetadata() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        vm.prank(creator1);
        hub.updateCreatorMetadata("ipfs://creator1-updated");
        
        (,string memory metadataURI,,) = hub.getCreatorProfile(creator1);
        assertEq(metadataURI, "ipfs://creator1-updated");
    }
    
    function testOnlyCreatorCanUpdateMetadata() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        vm.prank(user);
        vm.expectRevert("PredictionHub: not a registered creator");
        hub.updateCreatorMetadata("ipfs://hacked");
    }
    
    function testTransferOwnership() public {
        address newOwner = address(0x999);
        
        hub.transferOwnership(newOwner);
        assertEq(hub.owner(), newOwner);
    }
    
    function testOnlyOwnerCanTransferOwnership() public {
        vm.prank(user);
        vm.expectRevert("PredictionHub: caller is not owner");
        hub.transferOwnership(user);
    }
    
    function testCannotTransferOwnershipToZeroAddress() public {
        vm.expectRevert("PredictionHub: new owner is zero address");
        hub.transferOwnership(address(0));
    }
    
    function testGetHubStats() public {
        // Initial stats
        (uint256 totalCreators, uint256 totalMarkets, uint256 tvl) = hub.getHubStats();
        assertEq(totalCreators, 0);
        assertEq(totalMarkets, 0);
        assertEq(tvl, 0);
        
        // Register creators
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        vm.prank(creator2);
        hub.registerCreator("Creator Two", "ipfs://creator2");
        
        // Create markets
        vm.prank(creator1);
        address market1 = hub.createMarket("pm-1", "Market 1", block.timestamp + 7 days);
        
        vm.prank(creator2);
        address market2 = hub.createMarket("pm-2", "Market 2", block.timestamp + 14 days);
        
        // Add stakes
        vm.deal(user, 10 ether);
        vm.prank(user);
        Market(payable(market1)).stake{value: 3 ether}(Market.Outcome.A);
        
        vm.prank(user);
        Market(payable(market2)).stake{value: 2 ether}(Market.Outcome.B);
        
        // Check stats
        (totalCreators, totalMarkets, tvl) = hub.getHubStats();
        assertEq(totalCreators, 2);
        assertEq(totalMarkets, 2);
        assertEq(tvl, 5 ether);
    }
    
    function testMarketCreatedByCorrectCreator() public {
        vm.prank(creator1);
        hub.registerCreator("Creator One", "ipfs://creator1");
        
        vm.prank(creator2);
        hub.registerCreator("Creator Two", "ipfs://creator2");
        
        vm.prank(creator1);
        address market1 = hub.createMarket("pm-1", "Market 1", block.timestamp + 7 days);
        
        vm.prank(creator2);
        address market2 = hub.createMarket("pm-2", "Market 2", block.timestamp + 14 days);
        
        // Verify creators
        assertEq(Market(payable(market1)).creator(), creator1);
        assertEq(Market(payable(market2)).creator(), creator2);
        
        // Verify creator markets
        address[] memory creator1Markets = hub.getCreatorMarkets(creator1);
        address[] memory creator2Markets = hub.getCreatorMarkets(creator2);
        
        assertEq(creator1Markets.length, 1);
        assertEq(creator2Markets.length, 1);
        assertEq(creator1Markets[0], market1);
        assertEq(creator2Markets[0], market2);
    }
}

