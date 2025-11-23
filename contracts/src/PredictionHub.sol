// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Market.sol";
import "./NetworkConfig.sol";

/**
 * @title PredictionHub
 * @notice Factory contract for creator-driven prediction markets with community support
 * @dev Manages creator registration, community creation, and market deployment
 */
contract PredictionHub {
    // State variables
    NetworkConfig public networkConfig;
    address public owner;
    uint256 public marketCount;
    uint256 public communityCount;
    
    // Creator registry
    mapping(address => bool) public isCreator;
    mapping(address => address[]) public creatorMarkets;
    address[] public allCreators;
    
    // Market registry
    address[] public allMarkets;
    mapping(address => bool) public isMarket;
    
    // Community structures
    struct Community {
        uint256 id;
        string name;
        string description;
        string metadataURI;
        address creator;
        uint256 createdAt;
        uint256 memberCount;
        uint256 marketCount;
        bool isActive;
    }
    
    // Community storage
    mapping(uint256 => Community) public communities;
    mapping(uint256 => mapping(address => bool)) public communityMembers; // communityId => user => isMember
    mapping(uint256 => address[]) public communityMarkets; // communityId => market addresses
    mapping(address => uint256[]) public creatorCommunities; // creator => community IDs
    mapping(address => uint256[]) public userCommunities; // user => joined community IDs
    
    // Market to community mapping
    mapping(address => uint256) public marketCommunity; // market => communityId
    
    // Creator metadata
    struct CreatorProfile {
        string name;
        string metadataURI;
        uint256 marketCount;
        uint256 registeredAt;
    }
    mapping(address => CreatorProfile) public creatorProfiles;

    // Events
    event CreatorRegistered(address indexed creator, string name, uint256 timestamp);
    event CommunityCreated(
        uint256 indexed communityId,
        address indexed creator,
        string name,
        uint256 timestamp
    );
    event CommunityJoined(uint256 indexed communityId, address indexed user, uint256 timestamp);
    event CommunityLeft(uint256 indexed communityId, address indexed user, uint256 timestamp);
    event MarketCreated(
        address indexed marketAddress,
        address indexed creator,
        uint256 indexed communityId,
        string polymarketId,
        uint256 stakingDeadline,
        uint256 timestamp
    );
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "PredictionHub: caller is not owner");
        _;
    }

    modifier onlyRegisteredCreator() {
        require(isCreator[msg.sender], "PredictionHub: not a registered creator");
        _;
    }

    /**
     * @notice Initialize the PredictionHub
     * @param _networkConfig Address of NetworkConfig contract
     */
    constructor(address _networkConfig) {
        require(_networkConfig != address(0), "PredictionHub: invalid config address");
        owner = msg.sender;
        networkConfig = NetworkConfig(_networkConfig);
    }

    /**
     * @notice Register as a content creator
     * @param name Creator's display name
     * @param metadataURI URI pointing to creator's metadata (avatar, bio, etc.)
     */
    function registerCreator(string memory name, string memory metadataURI) external {
        require(!isCreator[msg.sender], "PredictionHub: already registered");
        require(bytes(name).length > 0, "PredictionHub: name cannot be empty");
        
        isCreator[msg.sender] = true;
        allCreators.push(msg.sender);
        
        creatorProfiles[msg.sender] = CreatorProfile({
            name: name,
            metadataURI: metadataURI,
            marketCount: 0,
            registeredAt: block.timestamp
        });
        
        emit CreatorRegistered(msg.sender, name, block.timestamp);
    }

    /**
     * @notice Create a new community
     * @param name Community name
     * @param description Community description
     * @param metadataURI URI pointing to community metadata (image, etc.)
     * @return communityId ID of the created community
     */
    function createCommunity(
        string memory name,
        string memory description,
        string memory metadataURI
    ) external onlyRegisteredCreator returns (uint256 communityId) {
        require(bytes(name).length > 0, "PredictionHub: name cannot be empty");
        
        communityId = communityCount++;
        
        communities[communityId] = Community({
            id: communityId,
            name: name,
            description: description,
            metadataURI: metadataURI,
            creator: msg.sender,
            createdAt: block.timestamp,
            memberCount: 1, // Creator is automatically a member
            marketCount: 0,
            isActive: true
        });
        
        // Creator automatically joins their community
        communityMembers[communityId][msg.sender] = true;
        creatorCommunities[msg.sender].push(communityId);
        userCommunities[msg.sender].push(communityId);
        
        emit CommunityCreated(communityId, msg.sender, name, block.timestamp);
        emit CommunityJoined(communityId, msg.sender, block.timestamp);
        
        return communityId;
    }

    /**
     * @notice Join a community
     * @param communityId ID of the community to join
     */
    function joinCommunity(uint256 communityId) external {
        require(communityId < communityCount, "PredictionHub: community does not exist");
        require(communities[communityId].isActive, "PredictionHub: community is not active");
        require(!communityMembers[communityId][msg.sender], "PredictionHub: already a member");
        
        communityMembers[communityId][msg.sender] = true;
        communities[communityId].memberCount++;
        userCommunities[msg.sender].push(communityId);
        
        emit CommunityJoined(communityId, msg.sender, block.timestamp);
    }

    /**
     * @notice Leave a community
     * @param communityId ID of the community to leave
     */
    function leaveCommunity(uint256 communityId) external {
        require(communityId < communityCount, "PredictionHub: community does not exist");
        require(communityMembers[communityId][msg.sender], "PredictionHub: not a member");
        require(communities[communityId].creator != msg.sender, "PredictionHub: creator cannot leave");
        
        communityMembers[communityId][msg.sender] = false;
        communities[communityId].memberCount--;
        
        // Remove from user's communities list
        uint256[] storage userComms = userCommunities[msg.sender];
        for (uint256 i = 0; i < userComms.length; i++) {
            if (userComms[i] == communityId) {
                userComms[i] = userComms[userComms.length - 1];
                userComms.pop();
                break;
            }
        }
        
        emit CommunityLeft(communityId, msg.sender, block.timestamp);
    }

    /**
     * @notice Create a new prediction market within a community
     * @param communityId ID of the community where the market will be created
     * @param polymarketId ID of the Polymarket market being imported
     * @param metadata Additional market metadata (description, etc.)
     * @param stakingDeadline When staking period ends
     * @return marketAddress Address of the deployed Market contract
     */
    function createMarket(
        uint256 communityId,
        string memory polymarketId,
        string memory metadata,
        uint256 stakingDeadline
    ) external onlyRegisteredCreator returns (address marketAddress) {
        require(communityId < communityCount, "PredictionHub: community does not exist");
        require(communities[communityId].isActive, "PredictionHub: community is not active");
        require(
            communities[communityId].creator == msg.sender,
            "PredictionHub: not community creator"
        );
        require(bytes(polymarketId).length > 0, "PredictionHub: invalid polymarket ID");
        require(stakingDeadline > block.timestamp, "PredictionHub: invalid deadline");
        
        // Validate staking duration
        NetworkConfig.ChainConfig memory config = networkConfig.getActiveConfig();
        uint256 duration = stakingDeadline - block.timestamp;
        require(
            duration <= config.maxStakingDuration,
            "PredictionHub: staking period too long"
        );
        
        // Deploy new Market contract
        Market market = new Market(
            msg.sender,
            polymarketId,
            metadata,
            stakingDeadline
        );
        
        marketAddress = address(market);
        
        // Register market
        allMarkets.push(marketAddress);
        isMarket[marketAddress] = true;
        creatorMarkets[msg.sender].push(marketAddress);
        creatorProfiles[msg.sender].marketCount++;
        marketCount++;
        
        // Associate market with community
        marketCommunity[marketAddress] = communityId;
        communityMarkets[communityId].push(marketAddress);
        communities[communityId].marketCount++;
        
        emit MarketCreated(
            marketAddress,
            msg.sender,
            communityId,
            polymarketId,
            stakingDeadline,
            block.timestamp
        );
        
        return marketAddress;
    }

    /**
     * @notice Get all markets created by a specific creator
     * @param creator The creator's address
     * @return markets Array of market addresses
     */
    function getCreatorMarkets(address creator) external view returns (address[] memory) {
        return creatorMarkets[creator];
    }

    /**
     * @notice Get all markets in a community
     * @param communityId ID of the community
     * @return markets Array of market addresses
     */
    function getCommunityMarkets(uint256 communityId) external view returns (address[] memory) {
        require(communityId < communityCount, "PredictionHub: community does not exist");
        return communityMarkets[communityId];
    }

    /**
     * @notice Check if a user is a member of a community
     * @param communityId ID of the community
     * @param user Address of the user
     * @return isMember Whether the user is a member
     */
    function isCommunityMember(uint256 communityId, address user) external view returns (bool) {
        require(communityId < communityCount, "PredictionHub: community does not exist");
        return communityMembers[communityId][user];
    }

    /**
     * @notice Get all communities a user has joined
     * @param user Address of the user
     * @return communityIds Array of community IDs
     */
    function getUserCommunities(address user) external view returns (uint256[] memory) {
        return userCommunities[user];
    }

    /**
     * @notice Get all communities created by a creator
     * @param creator Address of the creator
     * @return communityIds Array of community IDs
     */
    function getCreatorCommunities(address creator) external view returns (uint256[] memory) {
        return creatorCommunities[creator];
    }

    /**
     * @notice Get community details
     * @param communityId ID of the community
     * @return community Community struct
     */
    function getCommunity(uint256 communityId) external view returns (Community memory) {
        require(communityId < communityCount, "PredictionHub: community does not exist");
        return communities[communityId];
    }

    /**
     * @notice Get all active communities
     * @return activeCommunities Array of active community IDs
     */
    function getActiveCommunities() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < communityCount; i++) {
            if (communities[i].isActive) {
                activeCount++;
            }
        }
        
        uint256[] memory activeCommunities = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < communityCount; i++) {
            if (communities[i].isActive) {
                activeCommunities[index] = i;
                index++;
            }
        }
        
        return activeCommunities;
    }

    /**
     * @notice Get the community ID for a market
     * @param marketAddress Address of the market
     * @return communityId ID of the community
     */
    function getMarketCommunity(address marketAddress) external view returns (uint256) {
        require(isMarket[marketAddress], "PredictionHub: not a valid market");
        return marketCommunity[marketAddress];
    }

    /**
     * @notice Get all registered creators
     * @return creators Array of creator addresses
     */
    function getAllCreators() external view returns (address[] memory) {
        return allCreators;
    }

    /**
     * @notice Get all markets
     * @return markets Array of all market addresses
     */
    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    /**
     * @notice Get creator profile information
     * @param creator The creator's address
     * @return name Creator's name
     * @return metadataURI Creator's metadata URI
     * @return marketCountValue Number of markets created
     * @return registeredAt Registration timestamp
     */
    function getCreatorProfile(address creator) 
        external 
        view 
        returns (
            string memory name,
            string memory metadataURI,
            uint256 marketCountValue,
            uint256 registeredAt
        ) 
    {
        CreatorProfile memory profile = creatorProfiles[creator];
        return (
            profile.name,
            profile.metadataURI,
            profile.marketCount,
            profile.registeredAt
        );
    }

    /**
     * @notice Get active markets (still in Open state)
     * @return activeMarkets Array of active market addresses
     */
    function getActiveMarkets() external view returns (address[] memory) {
        // Count active markets
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allMarkets.length; i++) {
            Market market = Market(payable(allMarkets[i]));
            if (market.state() == Market.MarketState.Open) {
                activeCount++;
            }
        }
        
        // Build array
        address[] memory activeMarkets = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allMarkets.length; i++) {
            Market market = Market(payable(allMarkets[i]));
            if (market.state() == Market.MarketState.Open) {
                activeMarkets[index] = allMarkets[i];
                index++;
            }
        }
        
        return activeMarkets;
    }

    /**
     * @notice Get markets by state
     * @param targetState The state to filter by
     * @return markets Array of market addresses in that state
     */
    function getMarketsByState(Market.MarketState targetState) 
        external 
        view 
        returns (address[] memory) 
    {
        // Count markets in state
        uint256 count = 0;
        for (uint256 i = 0; i < allMarkets.length; i++) {
            Market market = Market(payable(allMarkets[i]));
            if (market.state() == targetState) {
                count++;
            }
        }
        
        // Build array
        address[] memory markets = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allMarkets.length; i++) {
            Market market = Market(payable(allMarkets[i]));
            if (market.state() == targetState) {
                markets[index] = allMarkets[i];
                index++;
            }
        }
        
        return markets;
    }

    /**
     * @notice Get total value locked across all markets
     * @return tvl Total value locked in wei
     */
    function getTotalValueLocked() external view returns (uint256 tvl) {
        for (uint256 i = 0; i < allMarkets.length; i++) {
            tvl += allMarkets[i].balance;
        }
        return tvl;
    }

    /**
     * @notice Update creator metadata
     * @param newMetadataURI New metadata URI
     */
    function updateCreatorMetadata(string memory newMetadataURI) 
        external 
        onlyRegisteredCreator 
    {
        creatorProfiles[msg.sender].metadataURI = newMetadataURI;
    }

    /**
     * @notice Update community metadata (creator only)
     * @param communityId ID of the community
     * @param newName New community name
     * @param newDescription New community description
     * @param newMetadataURI New metadata URI
     */
    function updateCommunity(
        uint256 communityId,
        string memory newName,
        string memory newDescription,
        string memory newMetadataURI
    ) external {
        require(communityId < communityCount, "PredictionHub: community does not exist");
        require(
            communities[communityId].creator == msg.sender,
            "PredictionHub: not community creator"
        );
        require(bytes(newName).length > 0, "PredictionHub: name cannot be empty");
        
        communities[communityId].name = newName;
        communities[communityId].description = newDescription;
        communities[communityId].metadataURI = newMetadataURI;
    }

    /**
     * @notice Toggle community active status (creator only)
     * @param communityId ID of the community
     */
    function toggleCommunityStatus(uint256 communityId) external {
        require(communityId < communityCount, "PredictionHub: community does not exist");
        require(
            communities[communityId].creator == msg.sender,
            "PredictionHub: not community creator"
        );
        
        communities[communityId].isActive = !communities[communityId].isActive;
    }

    /**
     * @notice Transfer ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "PredictionHub: new owner is zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @notice Get hub statistics
     * @return totalCreators Number of registered creators
     * @return totalMarkets Number of markets created
     * @return totalCommunities Number of communities created
     * @return tvl Total value locked
     */
    function getHubStats() 
        external 
        view 
        returns (
            uint256 totalCreators,
            uint256 totalMarkets,
            uint256 totalCommunities,
            uint256 tvl
        ) 
    {
        tvl = 0;
        for (uint256 i = 0; i < allMarkets.length; i++) {
            tvl += allMarkets[i].balance;
        }
        
        return (allCreators.length, allMarkets.length, communityCount, tvl);
    }
}

