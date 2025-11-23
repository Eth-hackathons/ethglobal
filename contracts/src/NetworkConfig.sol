// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title NetworkConfig
 * @notice Provides network-specific configuration for easy deployment across chains
 * @dev Supports local Anvil, Chiliz testnet (Spicy), and Chiliz mainnet
 */
contract NetworkConfig {
    struct ChainConfig {
        address wrappedNative; // WCHZ on Chiliz, WETH on others
        uint256 minStake;      // Minimum stake amount in wei
        uint256 maxStakingDuration; // Maximum staking window in seconds
    }

    // Chain IDs
    uint256 constant ANVIL_CHAIN_ID = 31337;
    uint256 constant CHILIZ_TESTNET_CHAIN_ID = 88882;
    uint256 constant CHILIZ_MAINNET_CHAIN_ID = 88888;

    // Default configuration values
    uint256 constant DEFAULT_MIN_STAKE = 0.01 ether; // 0.01 CHZ/ETH
    uint256 constant DEFAULT_MAX_DURATION = 30 days;

    /**
     * @notice Get the active chain configuration based on current chain ID
     * @return config The chain-specific configuration
     */
    function getActiveConfig() public view returns (ChainConfig memory config) {
        return getConfigByChainId(block.chainid);
    }

    /**
     * @notice Get configuration for a specific chain ID
     * @param chainId The target chain ID
     * @return config The chain-specific configuration
     */
    function getConfigByChainId(uint256 chainId) public pure returns (ChainConfig memory config) {
        if (chainId == ANVIL_CHAIN_ID) {
            return getAnvilConfig();
        } else if (chainId == CHILIZ_TESTNET_CHAIN_ID) {
            return getChilizTestnetConfig();
        } else if (chainId == CHILIZ_MAINNET_CHAIN_ID) {
            return getChilizMainnetConfig();
        } else {
            // Default to Anvil config for unknown chains
            return getAnvilConfig();
        }
    }

    /**
     * @notice Get Anvil/local configuration
     */
    function getAnvilConfig() public pure returns (ChainConfig memory) {
        return ChainConfig({
            wrappedNative: address(0), // Deploy mock WETH if needed
            minStake: DEFAULT_MIN_STAKE,
            maxStakingDuration: DEFAULT_MAX_DURATION
        });
    }

    /**
     * @notice Get Chiliz Spicy testnet configuration
     */
    function getChilizTestnetConfig() public pure returns (ChainConfig memory) {
        return ChainConfig({
            wrappedNative: address(0), // TODO: Add actual WCHZ testnet address when available
            minStake: DEFAULT_MIN_STAKE,
            maxStakingDuration: DEFAULT_MAX_DURATION
        });
    }

    /**
     * @notice Get Chiliz mainnet configuration
     */
    function getChilizMainnetConfig() public pure returns (ChainConfig memory) {
        return ChainConfig({
            wrappedNative: address(0), // TODO: Add actual WCHZ mainnet address
            minStake: 1 ether, // Higher minimum on mainnet
            maxStakingDuration: DEFAULT_MAX_DURATION
        });
    }

    /**
     * @notice Check if current chain is a testnet
     */
    function isTestnet() public view returns (bool) {
        return block.chainid == ANVIL_CHAIN_ID || block.chainid == CHILIZ_TESTNET_CHAIN_ID;
    }

    /**
     * @notice Get human-readable chain name
     */
    function getChainName() public view returns (string memory) {
        if (block.chainid == ANVIL_CHAIN_ID) return "Anvil";
        if (block.chainid == CHILIZ_TESTNET_CHAIN_ID) return "Chiliz Spicy Testnet";
        if (block.chainid == CHILIZ_MAINNET_CHAIN_ID) return "Chiliz Mainnet";
        return "Unknown Chain";
    }
}

