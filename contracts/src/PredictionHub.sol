// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Market.sol";
import "./NetworkConfig.sol";

/**
 * @title PredictionHub
 * @notice Factory contract for creator-driven prediction markets
 * @dev Manages creator registration and market deployment
 */
contract PredictionHub {
    // State variables
    NetworkConfig public networkConfig;
    address public owner;
    uint256 public marketCount;
    
    // Creator registry
    mapping(address => bool) public isCreator;
    mapping(address => address[]) public creatorMarkets;
    address[] public allCreators;
    
    // Market registry
    address[] public allMarkets;
    mapping(address => bool) public isMarket;
    
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
    event MarketCreated(
        address indexed marketAddress,
        address indexed creator,
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
     * @notice Create a new prediction market
     * @param polymarketId ID of the Polymarket market being imported
     * @param metadata Additional market metadata (description, etc.)
     * @param stakingDeadline When staking period ends
     * @return marketAddress Address of the deployed Market contract
     */
    function createMarket(
        string memory polymarketId,
        string memory metadata,
        uint256 stakingDeadline
    ) external onlyRegisteredCreator returns (address marketAddress) {
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
        
        emit MarketCreated(
            marketAddress,
            msg.sender,
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
     * @return tvl Total value locked
     */
    function getHubStats() 
        external 
        view 
        returns (
            uint256 totalCreators,
            uint256 totalMarkets,
            uint256 tvl
        ) 
    {
        tvl = 0;
        for (uint256 i = 0; i < allMarkets.length; i++) {
            tvl += allMarkets[i].balance;
        }
        
        return (allCreators.length, allMarkets.length, tvl);
    }
}

