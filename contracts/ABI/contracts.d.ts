/**
 * TypeScript type definitions for Prediction Hub contracts
 * Generated automatically from ABIs
 */

export interface ContractABI {
  abi: any[];
  description: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpc?: string;
}

export interface Contracts {
  NetworkConfig: ContractABI;
  MockPolymarket: ContractABI;
  Market: ContractABI;
  PredictionHub: ContractABI;
}

export interface Networks {
  anvil: NetworkConfig;
  chiliz_testnet: NetworkConfig;
  chiliz_mainnet: NetworkConfig;
}

export interface ContractInfo {
  contracts: Contracts;
  networks: Networks;
  version: string;
  extractedAt: string;
  totalContracts: number;
  successfulExtractions: number;
}

// Contract addresses (to be filled after deployment)
export interface DeployedAddresses {
  NetworkConfig?: string;
  MockPolymarket?: string;
  Market?: string;
  PredictionHub?: string;
}
