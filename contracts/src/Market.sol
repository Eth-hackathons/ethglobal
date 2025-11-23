// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Interface for PredictionHub to check community membership
interface IPredictionHub {
    function isCommunityMember(uint256 communityId, address user) external view returns (bool);
    function getMarketCommunity(address marketAddress) external view returns (uint256);
}

/**
 * @title Market
 * @notice Individual prediction market contract deployed by creators within communities
 * @dev Handles staking, mock bridging, and reward distribution for 3-outcome markets
 */
contract Market {
    // Enums
    enum Outcome { A, B, Draw }
    enum MarketState { Open, Locked, MockBridged, MockTrading, Settled, Completed }

    // State variables
    address public creator;
    address public hub; // PredictionHub that deployed this market
    string public polymarketId;
    string public metadata;
    uint256 public stakingDeadline;
    MarketState public state;
    
    // Stake tracking: outcome => user => amount
    mapping(Outcome => mapping(address => uint256)) public stakes;
    mapping(Outcome => uint256) public totalStakes;
    
    // Execution data
    Outcome public chosenOutcome; // Outcome creator chose to bet on
    Outcome public winningOutcome; // Actual winning outcome from Polymarket
    uint256 public totalPayout; // Amount returned from mock Polymarket
    bool public outcomeChosen; // Whether creator has made their choice
    bool public isSettled; // Whether market has been settled
    
    // Claim tracking
    mapping(address => bool) public hasClaimed;

    // Events
    event Staked(address indexed user, Outcome outcome, uint256 amount);
    event ExecutionTriggered(address indexed creator, Outcome chosenOutcome, uint256 totalPool);
    event MockBridged(uint256 amount, uint256 timestamp);
    event MockTrading(Outcome chosenOutcome, uint256 amount);
    event MarketSettled(Outcome winningOutcome, uint256 totalPayout);
    event Claimed(address indexed user, uint256 amount);
    event MarketCompleted();

    // Modifiers
    modifier onlyCreator() {
        require(msg.sender == creator, "Market: caller is not creator");
        _;
    }

    modifier onlyHub() {
        require(msg.sender == hub, "Market: caller is not hub");
        _;
    }

    modifier inState(MarketState _state) {
        require(state == _state, "Market: invalid state");
        _;
    }

    /**
     * @notice Initialize the market contract
     * @param _creator Address of the content creator
     * @param _polymarketId ID of the imported Polymarket market
     * @param _metadata Additional market metadata
     * @param _stakingDeadline Deadline for staking period
     */
    constructor(
        address _creator,
        string memory _polymarketId,
        string memory _metadata,
        uint256 _stakingDeadline
    ) {
        require(_creator != address(0), "Market: invalid creator");
        require(_stakingDeadline > block.timestamp, "Market: invalid deadline");
        
        creator = _creator;
        hub = msg.sender; // PredictionHub is the deployer
        polymarketId = _polymarketId;
        metadata = _metadata;
        stakingDeadline = _stakingDeadline;
        state = MarketState.Open;
    }

    /**
     * @notice Stake CHZ on a specific outcome (community members only)
     * @param outcome The outcome to stake on (A, B, or Draw)
     */
    function stake(Outcome outcome) external payable inState(MarketState.Open) {
        require(block.timestamp < stakingDeadline, "Market: staking period ended");
        require(msg.value > 0, "Market: must stake non-zero amount");
        
        // Check if user is a member of the market's community
        IPredictionHub hubContract = IPredictionHub(hub);
        uint256 communityId = hubContract.getMarketCommunity(address(this));
        require(
            hubContract.isCommunityMember(communityId, msg.sender),
            "Market: must be community member to stake"
        );
        
        stakes[outcome][msg.sender] += msg.value;
        totalStakes[outcome] += msg.value;
        
        emit Staked(msg.sender, outcome, msg.value);
    }

    /**
     * @notice Creator triggers execution by choosing an outcome
     * @param outcome The outcome the creator wants to bet on
     */
    function triggerExecution(Outcome outcome) external onlyCreator inState(MarketState.Open) {
        require(getTotalPool() > 0, "Market: no stakes");
        
        chosenOutcome = outcome;
        outcomeChosen = true;
        state = MarketState.Locked;
        
        uint256 totalPool = getTotalPool();
        
        emit ExecutionTriggered(creator, outcome, totalPool);
        
        // Automatically progress to mock bridge
        _mockBridge();
    }

    /**
     * @notice Simulate bridging funds to Polygon
     * @dev Internal function - happens automatically after trigger
     */
    function _mockBridge() internal inState(MarketState.Locked) {
        state = MarketState.MockBridged;
        uint256 totalPool = getTotalPool();
        
        emit MockBridged(totalPool, block.timestamp);
        
        // Automatically progress to mock trading
        _mockTrading();
    }

    /**
     * @notice Simulate placing trade on Polymarket
     * @dev Internal function - happens automatically after bridge
     */
    function _mockTrading() internal inState(MarketState.MockBridged) {
        state = MarketState.MockTrading;
        uint256 totalPool = getTotalPool();
        
        emit MockTrading(chosenOutcome, totalPool);
    }

    /**
     * @notice Simulate Polymarket resolution and fund return
     * @param _winningOutcome The outcome that won on Polymarket
     * @param _payout The amount returned (simulated)
     * @dev Called by MockPolymarket contract or creator for testing
     */
    function mockPolymarketReturn(Outcome _winningOutcome, uint256 _payout) 
        external 
        payable
        inState(MarketState.MockTrading) 
    {
        // In production, only MockPolymarket or CRE would call this
        // For MVP, allow creator to simulate for testing
        require(
            msg.sender == creator || msg.sender == hub,
            "Market: unauthorized"
        );
        
        winningOutcome = _winningOutcome;
        totalPayout = _payout;
        isSettled = true;
        state = MarketState.Settled;
        
        emit MarketSettled(_winningOutcome, _payout);
    }

    /**
     * @notice Claim rewards for winning stakers
     * @dev Only users who staked on the creator's choice AND it won can claim
     */
    function claim() external inState(MarketState.Settled) {
        require(!hasClaimed[msg.sender], "Market: already claimed");
        require(outcomeChosen, "Market: no outcome chosen");
        
        // Only winners can claim: those who staked on creator's choice AND it matched the winning outcome
        bool isWinner = (chosenOutcome == winningOutcome);
        require(isWinner, "Market: chosen outcome did not win");
        
        uint256 userStake = stakes[chosenOutcome][msg.sender];
        require(userStake > 0, "Market: no stake on winning outcome");
        
        // Calculate proportional reward
        uint256 totalWinningStake = totalStakes[chosenOutcome];
        uint256 reward = (userStake * totalPayout) / totalWinningStake;
        
        hasClaimed[msg.sender] = true;
        
        // Transfer reward
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Market: transfer failed");
        
        emit Claimed(msg.sender, reward);
        
        // Check if all funds distributed to mark as completed
        if (address(this).balance == 0) {
            state = MarketState.Completed;
            emit MarketCompleted();
        }
    }

    /**
     * @notice Get user's stake for a specific outcome
     * @param user The user address
     * @param outcome The outcome to query
     * @return The stake amount
     */
    function getStake(address user, Outcome outcome) external view returns (uint256) {
        return stakes[outcome][user];
    }

    /**
     * @notice Get total stakes for all outcomes
     * @return totalA Total staked on outcome A
     * @return totalB Total staked on outcome B
     * @return totalDraw Total staked on Draw
     */
    function getPoolInfo() external view returns (uint256 totalA, uint256 totalB, uint256 totalDraw) {
        return (totalStakes[Outcome.A], totalStakes[Outcome.B], totalStakes[Outcome.Draw]);
    }

    /**
     * @notice Get total pool across all outcomes
     * @return Total amount staked
     */
    function getTotalPool() public view returns (uint256) {
        return totalStakes[Outcome.A] + totalStakes[Outcome.B] + totalStakes[Outcome.Draw];
    }

    /**
     * @notice Get user's potential reward if they win
     * @param user The user address
     * @return Potential reward amount (0 if market not settled or user didn't stake on winning side)
     */
    function getPotentialReward(address user) external view returns (uint256) {
        if (!isSettled) return 0;
        if (chosenOutcome != winningOutcome) return 0;
        
        uint256 userStake = stakes[chosenOutcome][user];
        if (userStake == 0) return 0;
        
        uint256 totalWinningStake = totalStakes[chosenOutcome];
        return (userStake * totalPayout) / totalWinningStake;
    }

    /**
     * @notice Check if user is eligible to claim
     * @param user The user address
     * @return eligible Whether user can claim
     */
    function canClaim(address user) external view returns (bool eligible) {
        if (state != MarketState.Settled) return false;
        if (hasClaimed[user]) return false;
        if (!outcomeChosen) return false;
        if (chosenOutcome != winningOutcome) return false;
        if (stakes[chosenOutcome][user] == 0) return false;
        return true;
    }

    /**
     * @notice Get market summary
     */
    function getMarketSummary() external view returns (
        MarketState currentState,
        uint256 totalPool,
        uint256 stakeA,
        uint256 stakeB,
        uint256 stakeDraw,
        bool hasChosenOutcome,
        Outcome chosen,
        bool settled,
        Outcome winner
    ) {
        return (
            state,
            getTotalPool(),
            totalStakes[Outcome.A],
            totalStakes[Outcome.B],
            totalStakes[Outcome.Draw],
            outcomeChosen,
            chosenOutcome,
            isSettled,
            winningOutcome
        );
    }

    /**
     * @notice Emergency withdraw for creator if market fails
     * @dev Only callable if market is still Open and past deadline with no stakes
     */
    function emergencyWithdraw() external onlyCreator {
        require(
            state == MarketState.Open && block.timestamp > stakingDeadline + 7 days,
            "Market: cannot emergency withdraw"
        );
        require(getTotalPool() == 0, "Market: has stakes");
        
        state = MarketState.Completed;
        emit MarketCompleted();
    }

    // Receive function to accept payout
    receive() external payable {
        // Accept funds from mock Polymarket return
    }
}

