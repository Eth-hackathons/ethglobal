// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/NetworkConfig.sol";
import "../src/MockPolymarket.sol";
import "../src/PredictionHub.sol";

/**
 * @title Deploy
 * @notice Deployment script for PredictionHub ecosystem
 * @dev Run with: forge script script/Deploy.s.sol --rpc-url <RPC> --broadcast
 */
contract Deploy is Script {
    // Deployment addresses (will be set during deployment)
    NetworkConfig public networkConfig;
    MockPolymarket public mockPolymarket;
    PredictionHub public predictionHub;

    function run() external {
        // Get deployment private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy NetworkConfig
        console.log("Deploying NetworkConfig...");
        networkConfig = new NetworkConfig();
        console.log("NetworkConfig deployed at:", address(networkConfig));
        
        // Log chain info
        NetworkConfig.ChainConfig memory config = networkConfig.getActiveConfig();
        console.log("Chain:", networkConfig.getChainName());
        console.log("Min Stake:", config.minStake);
        console.log("Max Staking Duration:", config.maxStakingDuration);
        
        // 2. Deploy MockPolymarket
        console.log("\nDeploying MockPolymarket...");
        mockPolymarket = new MockPolymarket();
        console.log("MockPolymarket deployed at:", address(mockPolymarket));
        
        // 3. Deploy PredictionHub
        console.log("\nDeploying PredictionHub...");
        predictionHub = new PredictionHub(address(networkConfig));
        console.log("PredictionHub deployed at:", address(predictionHub));
        
        vm.stopBroadcast();
        
        // Log summary
        console.log("\n=== Deployment Summary ===");
        console.log("NetworkConfig:", address(networkConfig));
        console.log("MockPolymarket:", address(mockPolymarket));
        console.log("PredictionHub:", address(predictionHub));
        console.log("========================");
        
        // Save deployment addresses to file for frontend integration
        _saveDeploymentInfo();
    }

    /**
     * @notice Save deployment information to a JSON-like format
     * @dev In production, you might want to use a proper JSON library
     */
    function _saveDeploymentInfo() internal view {
        console.log("\n=== Frontend Integration ===");
        console.log("Copy these addresses for your frontend:");
        console.log("{");
        console.log('  "networkConfig": "%s",', address(networkConfig));
        console.log('  "mockPolymarket": "%s",', address(mockPolymarket));
        console.log('  "predictionHub": "%s",', address(predictionHub));
        console.log('  "chainId": %s,', block.chainid);
        console.log('  "chainName": "%s"', networkConfig.getChainName());
        console.log("}");
    }
}

