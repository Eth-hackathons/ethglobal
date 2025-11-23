#!/usr/bin/env node
/**
 * Extract ABIs from compiled Foundry contracts
 * Usage: node script/extractABI.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUT_DIR = './out';
const ABI_DIR = './ABI';
const CONTRACTS = [
    'NetworkConfig',
    'MockPolymarket',
    'Market',
    'PredictionHub'
];

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log(`✓ Created directory: ${dir}`, 'green');
    }
}

function extractABI(contractName) {
    const sourceFile = path.join(OUT_DIR, `${contractName}.sol`, `${contractName}.json`);
    const targetFile = path.join(ABI_DIR, `${contractName}.json`);
    
    try {
        if (!fs.existsSync(sourceFile)) {
            log(`⚠️  Contract not found: ${contractName} - run 'forge build' first`, 'yellow');
            return false;
        }
        
        // Read the compiled contract
        const artifact = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
        
        // Extract just the ABI
        const abi = artifact.abi || [];
        
        // Save ABI to file with pretty formatting
        fs.writeFileSync(targetFile, JSON.stringify(abi, null, 2));
        
        log(`✓ Extracted ABI: ${contractName}.json`, 'green');
        return true;
    } catch (error) {
        log(`✗ Error extracting ${contractName}: ${error.message}`, 'red');
        return false;
    }
}

function extractBytecode(contractName) {
    const sourceFile = path.join(OUT_DIR, `${contractName}.sol`, `${contractName}.json`);
    const targetFile = path.join(ABI_DIR, `${contractName}.bytecode.json`);
    
    try {
        if (!fs.existsSync(sourceFile)) {
            return false;
        }
        
        const artifact = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
        
        // Extract bytecode info
        const bytecodeInfo = {
            bytecode: artifact.bytecode?.object || '',
            deployedBytecode: artifact.deployedBytecode?.object || ''
        };
        
        fs.writeFileSync(targetFile, JSON.stringify(bytecodeInfo, null, 2));
        
        return true;
    } catch (error) {
        return false;
    }
}

function createSummary(successCount) {
    const summary = {
        contracts: {
            NetworkConfig: {
                abi: './NetworkConfig.json',
                description: 'Multi-chain configuration contract'
            },
            MockPolymarket: {
                abi: './MockPolymarket.json',
                description: 'Mock oracle for testing market resolution'
            },
            Market: {
                abi: './Market.json',
                description: 'Individual prediction market contract'
            },
            PredictionHub: {
                abi: './PredictionHub.json',
                description: 'Factory contract for creators and markets'
            }
        },
        networks: {
            anvil: { chainId: 31337, name: 'Local Anvil' },
            chiliz_testnet: { chainId: 88882, name: 'Chiliz Spicy Testnet', rpc: 'https://spicy-rpc.chiliz.com' },
            chiliz_mainnet: { chainId: 88888, name: 'Chiliz Mainnet', rpc: 'https://rpc.chiliz.com' }
        },
        version: '1.0.0',
        extractedAt: new Date().toISOString(),
        totalContracts: CONTRACTS.length,
        successfulExtractions: successCount
    };
    
    const summaryFile = path.join(ABI_DIR, 'contracts.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    log(`✓ Created summary: contracts.json`, 'green');
}

function createTypeScriptTypes() {
    const typeFile = path.join(ABI_DIR, 'contracts.d.ts');
    const typeDefinitions = `/**
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
`;
    
    fs.writeFileSync(typeFile, typeDefinitions);
    log(`✓ Created TypeScript definitions: contracts.d.ts`, 'green');
}

function createDeploymentTemplate() {
    const template = {
        network: 'anvil',
        chainId: 31337,
        deployedAt: null,
        deployer: null,
        contracts: {
            NetworkConfig: null,
            MockPolymarket: null,
            Market: null,
            PredictionHub: null
        }
    };
    
    const templateFile = path.join(ABI_DIR, 'deployment.template.json');
    fs.writeFileSync(templateFile, JSON.stringify(template, null, 2));
    log(`✓ Created deployment template: deployment.template.json`, 'blue');
}

// Main execution
function main() {
    console.log('');
    log('🔍 Extracting ABIs from compiled contracts...', 'blue');
    console.log('');
    
    // Ensure ABI directory exists
    ensureDirectoryExists(ABI_DIR);
    
    // Extract ABIs
    let successCount = 0;
    for (const contract of CONTRACTS) {
        if (extractABI(contract)) {
            successCount++;
            // Also extract bytecode for deployment
            extractBytecode(contract);
        }
    }
    
    console.log('');
    
    // Create additional files
    if (successCount > 0) {
        createSummary(successCount);
        createTypeScriptTypes();
        createDeploymentTemplate();
        
        console.log('');
        log('✨ ABIs extracted successfully!', 'green');
        log(`📁 Location: ${ABI_DIR}/`, 'blue');
        console.log('');
        
        // List files
        const files = fs.readdirSync(ABI_DIR);
        log('Files created:', 'blue');
        files.forEach(file => {
            const stats = fs.statSync(path.join(ABI_DIR, file));
            const size = (stats.size / 1024).toFixed(2);
            console.log(`  - ${file} (${size} KB)`);
        });
        console.log('');
    } else {
        console.log('');
        log('⚠️  No ABIs extracted. Make sure to run "forge build" first.', 'yellow');
        console.log('');
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { extractABI, ensureDirectoryExists };

