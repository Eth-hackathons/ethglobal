// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PredictionHub.sol";
import "../src/Market.sol";
import "../src/NetworkConfig.sol";

contract CommunityTest is Test {
    PredictionHub public hub;
    NetworkConfig public config;
    
    address public creator1;
    address public creator2;
    address public user1;
    address public user2;
    address public user3;
    
    string constant CREATOR1_NAME = "Creator One";
    string constant CREATOR2_NAME = "Creator Two";
    string constant METADATA_URI = "ipfs://metadata";
    
    string constant COMMUNITY1_NAME = "Sports Community";
    string constant COMMUNITY1_DESC = "All about sports predictions";
    string constant COMMUNITY2_NAME = "Politics Community";
    string constant COMMUNITY2_DESC = "Political predictions";
    
    event CommunityCreated(
        uint256 indexed communityId,
        address indexed creator,
        string name,
        uint256 timestamp
    );
    
    event CommunityJoined(
        uint256 indexed communityId,
        address indexed user,
        uint256 timestamp
    );
    
    event CommunityLeft(
        uint256 indexed communityId,
        address indexed user,
        uint256 timestamp
    );
    
    event MarketCreated(
        address indexed marketAddress,
        address indexed creator,
        uint256 indexed communityId,
        string polymarketId,
        uint256 stakingDeadline,
        uint256 timestamp
    );
    
    function setUp() public {
        // Create test accounts
        creator1 = makeAddr("creator1");
        creator2 = makeAddr("creator2");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy contracts
        config = new NetworkConfig();
        hub = new PredictionHub(address(config));
        
        // Register creators
        vm.prank(creator1);
        hub.registerCreator(CREATOR1_NAME, METADATA_URI);
        
        vm.prank(creator2);
        hub.registerCreator(CREATOR2_NAME, METADATA_URI);
    }
    
    // ========== Community Creation Tests ==========
    
    function test_CreateCommunity() public {
        vm.prank(creator1);
        
        vm.expectEmit(true, true, false, true);
        emit CommunityCreated(0, creator1, COMMUNITY1_NAME, block.timestamp);
        
        uint256 communityId = hub.createCommunity(
            COMMUNITY1_NAME,
            COMMUNITY1_DESC,
            METADATA_URI
        );
        
        assertEq(communityId, 0);
        
        PredictionHub.Community memory community = hub.getCommunity(communityId);
        assertEq(community.id, 0);
        assertEq(community.name, COMMUNITY1_NAME);
        assertEq(community.description, COMMUNITY1_DESC);
        assertEq(community.metadataURI, METADATA_URI);
        assertEq(community.creator, creator1);
        assertEq(community.memberCount, 1); // Creator is auto-joined
        assertEq(community.marketCount, 0);
        assertTrue(community.isActive);
    }
    
    function test_CreateMultipleCommunities() public {
        vm.prank(creator1);
        uint256 communityId1 = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(creator2);
        uint256 communityId2 = hub.createCommunity(COMMUNITY2_NAME, COMMUNITY2_DESC, METADATA_URI);
        
        assertEq(communityId1, 0);
        assertEq(communityId2, 1);
        
        PredictionHub.Community memory community1 = hub.getCommunity(communityId1);
        PredictionHub.Community memory community2 = hub.getCommunity(communityId2);
        
        assertEq(community1.creator, creator1);
        assertEq(community2.creator, creator2);
    }
    
    function test_RevertWhen_NonCreatorCreatesCommunity() public {
        vm.prank(user1);
        vm.expectRevert("PredictionHub: not a registered creator");
        hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
    }
    
    function test_RevertWhen_CreateCommunityWithEmptyName() public {
        vm.prank(creator1);
        vm.expectRevert("PredictionHub: name cannot be empty");
        hub.createCommunity("", COMMUNITY1_DESC, METADATA_URI);
    }
    
    function test_CreatorAutoJoinsCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        assertTrue(hub.isCommunityMember(communityId, creator1));
        
        uint256[] memory creatorCommunities = hub.getUserCommunities(creator1);
        assertEq(creatorCommunities.length, 1);
        assertEq(creatorCommunities[0], communityId);
    }
    
    // ========== Community Joining Tests ==========
    
    function test_JoinCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit CommunityJoined(communityId, user1, block.timestamp);
        hub.joinCommunity(communityId);
        
        assertTrue(hub.isCommunityMember(communityId, user1));
        
        PredictionHub.Community memory community = hub.getCommunity(communityId);
        assertEq(community.memberCount, 2); // Creator + user1
    }
    
    function test_MultipleUsersJoinCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(user1);
        hub.joinCommunity(communityId);
        
        vm.prank(user2);
        hub.joinCommunity(communityId);
        
        vm.prank(user3);
        hub.joinCommunity(communityId);
        
        assertTrue(hub.isCommunityMember(communityId, user1));
        assertTrue(hub.isCommunityMember(communityId, user2));
        assertTrue(hub.isCommunityMember(communityId, user3));
        
        PredictionHub.Community memory community = hub.getCommunity(communityId);
        assertEq(community.memberCount, 4); // Creator + 3 users
    }
    
    function test_RevertWhen_JoinNonexistentCommunity() public {
        vm.prank(user1);
        vm.expectRevert("PredictionHub: community does not exist");
        hub.joinCommunity(999);
    }
    
    function test_RevertWhen_JoinCommunityTwice() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(user1);
        hub.joinCommunity(communityId);
        
        vm.prank(user1);
        vm.expectRevert("PredictionHub: already a member");
        hub.joinCommunity(communityId);
    }
    
    function test_RevertWhen_JoinInactiveCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        // Deactivate community
        vm.prank(creator1);
        hub.toggleCommunityStatus(communityId);
        
        vm.prank(user1);
        vm.expectRevert("PredictionHub: community is not active");
        hub.joinCommunity(communityId);
    }
    
    // ========== Community Leaving Tests ==========
    
    function test_LeaveCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(user1);
        hub.joinCommunity(communityId);
        
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit CommunityLeft(communityId, user1, block.timestamp);
        hub.leaveCommunity(communityId);
        
        assertFalse(hub.isCommunityMember(communityId, user1));
        
        PredictionHub.Community memory community = hub.getCommunity(communityId);
        assertEq(community.memberCount, 1); // Only creator remains
    }
    
    function test_RevertWhen_CreatorLeavesCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(creator1);
        vm.expectRevert("PredictionHub: creator cannot leave");
        hub.leaveCommunity(communityId);
    }
    
    function test_RevertWhen_NonMemberLeavesCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(user1);
        vm.expectRevert("PredictionHub: not a member");
        hub.leaveCommunity(communityId);
    }
    
    // ========== Market Creation in Community Tests ==========
    
    function test_CreateMarketInCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        uint256 stakingDeadline = block.timestamp + 1 days;
        
        vm.prank(creator1);
        address marketAddress = hub.createMarket(
            communityId,
            "polymarket-id-1",
            "Will X win?",
            stakingDeadline
        );
        
        assertTrue(marketAddress != address(0));
        assertEq(hub.getMarketCommunity(marketAddress), communityId);
        
        address[] memory markets = hub.getCommunityMarkets(communityId);
        assertEq(markets.length, 1);
        assertEq(markets[0], marketAddress);
        
        PredictionHub.Community memory community = hub.getCommunity(communityId);
        assertEq(community.marketCount, 1);
    }
    
    function test_CreateMultipleMarketsInCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        uint256 stakingDeadline = block.timestamp + 1 days;
        
        vm.prank(creator1);
        address market1 = hub.createMarket(communityId, "polymarket-id-1", "Market 1", stakingDeadline);
        
        vm.prank(creator1);
        address market2 = hub.createMarket(communityId, "polymarket-id-2", "Market 2", stakingDeadline);
        
        address[] memory markets = hub.getCommunityMarkets(communityId);
        assertEq(markets.length, 2);
        assertEq(markets[0], market1);
        assertEq(markets[1], market2);
        
        PredictionHub.Community memory community = hub.getCommunity(communityId);
        assertEq(community.marketCount, 2);
    }
    
    function test_RevertWhen_NonCreatorCreatesMarketInCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        uint256 stakingDeadline = block.timestamp + 1 days;
        
        vm.prank(creator2);
        vm.expectRevert("PredictionHub: not community creator");
        hub.createMarket(communityId, "polymarket-id-1", "Market 1", stakingDeadline);
    }
    
    // ========== Community Member Staking Tests ==========
    
    function test_CommunityMemberCanStake() public {
        // Create community and market
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        uint256 stakingDeadline = block.timestamp + 1 days;
        vm.prank(creator1);
        address marketAddress = hub.createMarket(communityId, "polymarket-id-1", "Market 1", stakingDeadline);
        
        // User joins community
        vm.prank(user1);
        hub.joinCommunity(communityId);
        
        // User stakes
        Market market = Market(payable(marketAddress));
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        market.stake{value: 0.5 ether}(Market.Outcome.A);
        
        assertEq(market.getStake(user1, Market.Outcome.A), 0.5 ether);
    }
    
    function test_RevertWhen_NonMemberTriesToStake() public {
        // Create community and market
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        uint256 stakingDeadline = block.timestamp + 1 days;
        vm.prank(creator1);
        address marketAddress = hub.createMarket(communityId, "polymarket-id-1", "Market 1", stakingDeadline);
        
        // User tries to stake without joining community
        Market market = Market(payable(marketAddress));
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vm.expectRevert("Market: must be community member to stake");
        market.stake{value: 0.5 ether}(Market.Outcome.A);
    }
    
    function test_CreatorCanStakeInOwnCommunity() public {
        // Create community and market
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        uint256 stakingDeadline = block.timestamp + 1 days;
        vm.prank(creator1);
        address marketAddress = hub.createMarket(communityId, "polymarket-id-1", "Market 1", stakingDeadline);
        
        // Creator stakes (auto-member)
        Market market = Market(payable(marketAddress));
        vm.deal(creator1, 1 ether);
        vm.prank(creator1);
        market.stake{value: 0.5 ether}(Market.Outcome.B);
        
        assertEq(market.getStake(creator1, Market.Outcome.B), 0.5 ether);
    }
    
    // ========== Community Management Tests ==========
    
    function test_UpdateCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        string memory newName = "Updated Community";
        string memory newDesc = "New description";
        string memory newURI = "ipfs://new-metadata";
        
        vm.prank(creator1);
        hub.updateCommunity(communityId, newName, newDesc, newURI);
        
        PredictionHub.Community memory community = hub.getCommunity(communityId);
        assertEq(community.name, newName);
        assertEq(community.description, newDesc);
        assertEq(community.metadataURI, newURI);
    }
    
    function test_RevertWhen_NonCreatorUpdatesCommunity() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(creator2);
        vm.expectRevert("PredictionHub: not community creator");
        hub.updateCommunity(communityId, "New Name", "New Desc", "ipfs://new");
    }
    
    function test_ToggleCommunityStatus() public {
        vm.prank(creator1);
        uint256 communityId = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        assertTrue(hub.getCommunity(communityId).isActive);
        
        vm.prank(creator1);
        hub.toggleCommunityStatus(communityId);
        
        assertFalse(hub.getCommunity(communityId).isActive);
        
        vm.prank(creator1);
        hub.toggleCommunityStatus(communityId);
        
        assertTrue(hub.getCommunity(communityId).isActive);
    }
    
    // ========== Community Query Tests ==========
    
    function test_GetActiveCommunities() public {
        vm.prank(creator1);
        uint256 communityId1 = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(creator2);
        uint256 communityId2 = hub.createCommunity(COMMUNITY2_NAME, COMMUNITY2_DESC, METADATA_URI);
        
        // Deactivate one community
        vm.prank(creator1);
        hub.toggleCommunityStatus(communityId1);
        
        uint256[] memory activeCommunities = hub.getActiveCommunities();
        assertEq(activeCommunities.length, 1);
        assertEq(activeCommunities[0], communityId2);
    }
    
    function test_GetUserCommunities() public {
        vm.prank(creator1);
        uint256 communityId1 = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(creator2);
        uint256 communityId2 = hub.createCommunity(COMMUNITY2_NAME, COMMUNITY2_DESC, METADATA_URI);
        
        vm.prank(user1);
        hub.joinCommunity(communityId1);
        
        vm.prank(user1);
        hub.joinCommunity(communityId2);
        
        uint256[] memory userCommunities = hub.getUserCommunities(user1);
        assertEq(userCommunities.length, 2);
    }
    
    function test_GetCreatorCommunities() public {
        vm.prank(creator1);
        uint256 communityId1 = hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(creator1);
        uint256 communityId2 = hub.createCommunity("Community 2", "Desc 2", METADATA_URI);
        
        uint256[] memory creatorCommunities = hub.getCreatorCommunities(creator1);
        assertEq(creatorCommunities.length, 2);
        assertEq(creatorCommunities[0], communityId1);
        assertEq(creatorCommunities[1], communityId2);
    }
    
    function test_GetHubStatsWithCommunities() public {
        vm.prank(creator1);
        hub.createCommunity(COMMUNITY1_NAME, COMMUNITY1_DESC, METADATA_URI);
        
        vm.prank(creator2);
        hub.createCommunity(COMMUNITY2_NAME, COMMUNITY2_DESC, METADATA_URI);
        
        (uint256 totalCreators, uint256 totalMarkets, uint256 totalCommunities, uint256 tvl) = hub.getHubStats();
        
        assertEq(totalCreators, 2);
        assertEq(totalMarkets, 0);
        assertEq(totalCommunities, 2);
        assertEq(tvl, 0);
    }
}

