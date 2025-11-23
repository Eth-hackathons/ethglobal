// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title MockPolymarket
 * @notice Simulates Polymarket behavior for testing and development
 * @dev In production, this will be replaced by Chainlink CRE + real Polymarket integration
 */
contract MockPolymarket {
    enum Outcome { A, B, Draw }

    struct MarketResolution {
        bool resolved;
        Outcome winningOutcome;
        uint256 timestamp;
    }

    // Owner/admin who can resolve markets (simulating Polymarket oracle)
    address public owner;
    
    // Market resolutions: marketAddress => resolution data
    mapping(address => MarketResolution) public resolutions;

    // Events
    event MarketResolved(address indexed marketAddress, Outcome winningOutcome, uint256 payout);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "MockPolymarket: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Resolve a market with a winning outcome
     * @param marketAddress The address of the market contract
     * @param winningOutcome The outcome that won (A, B, or Draw)
     * @dev This simulates what would happen when Polymarket resolves a real market
     */
    function resolveMarket(address marketAddress, Outcome winningOutcome) internal onlyOwner {
        require(!resolutions[marketAddress].resolved, "MockPolymarket: already resolved");
        require(marketAddress != address(0), "MockPolymarket: invalid market address");

        resolutions[marketAddress] = MarketResolution({
            resolved: true,
            winningOutcome: winningOutcome,
            timestamp: block.timestamp
        });

        // Calculate mock payout (the Market contract will handle the actual distribution)
        uint256 payout = calculatePayout(marketAddress, winningOutcome);

        emit MarketResolved(marketAddress, winningOutcome, payout);
    }

    /**
     * @notice Calculate the payout for a market based on outcome
     * @param marketAddress The market to calculate payout for
     * @param winningOutcome The winning outcome
     * @return payout The calculated payout amount
     * @dev In MVP, we simulate: if creator's choice won, return total pool; if lost, return 0
     */
    function calculatePayout(address marketAddress, Outcome winningOutcome) 
        public 
        view 
        returns (uint256 payout) 
    {
        // Get total staked amount from the market
        // This is a simplified calculation - in reality, Polymarket has complex odds
        uint256 balance = marketAddress.balance;
        
        // Simple simulation: return the entire pool as potential payout
        // The Market contract will determine actual distribution
        return balance;
    }

    /**
     * @notice Check if a market has been resolved
     * @param marketAddress The market to check
     * @return resolved Whether the market is resolved
     */
    function isResolved(address marketAddress) external view returns (bool) {
        return resolutions[marketAddress].resolved;
    }

    /**
     * @notice Get resolution details for a market
     * @param marketAddress The market to query
     * @return resolved Whether resolved
     * @return winningOutcome The winning outcome
     * @return timestamp When it was resolved
     */
    function getResolution(address marketAddress) 
        external 
        view 
        returns (bool resolved, Outcome winningOutcome, uint256 timestamp) 
    {
        MarketResolution memory resolution = resolutions[marketAddress];
        return (resolution.resolved, resolution.winningOutcome, resolution.timestamp);
    }

    /**
     * @notice Transfer ownership to a new address
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "MockPolymarket: new owner is zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @notice Simulate a quick resolution (for testing)
     * @param marketAddress The market to resolve
     * @param creatorWon Whether the creator's chosen outcome won
     * @dev Helper function to make testing easier
     */
    function quickResolve(address marketAddress, bool creatorWon, Outcome creatorChoice) 
        external 
        onlyOwner 
    {
        require(!resolutions[marketAddress].resolved, "MockPolymarket: already resolved");
        
        Outcome winningOutcome;
        if (creatorWon) {
            winningOutcome = creatorChoice;
        } else {
            // If creator chose A and lost, make B win (simplified logic)
            if (creatorChoice == Outcome.A) {
                winningOutcome = Outcome.B;
            } else if (creatorChoice == Outcome.B) {
                winningOutcome = Outcome.A;
            } else {
                winningOutcome = Outcome.A; // If creator chose Draw and lost
            }
        }

        resolveMarket(marketAddress, winningOutcome);
    }
}

