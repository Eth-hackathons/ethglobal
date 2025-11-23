#!/usr/bin/env node
/**
 * Foundry Utils CLI
 * Simple CLI for local blockchain testing with Anvil
 * Usage: node cli.js <command> [args]
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
    log(`❌ Error: ${message}`, 'red');
    process.exit(1);
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function info(message) {
    log(`ℹ️  ${message}`, 'cyan');
}

// Default Anvil configuration
const ANVIL_RPC = 'http://localhost:8545';
const ANVIL_CHAIN_ID = 31337;

// Store for running processes
let anvilProcess = null;

// ============================================================================
// COMMAND: run - Start Anvil
// ============================================================================
function runAnvil(args = []) {
    log('\n🚀 Starting Anvil...', 'bright');
    
    const anvilArgs = [
        '--host', '0.0.0.0',
        '--port', '8545',
        '--chain-id', '31337',
        ...args
    ];
    
    anvilProcess = spawn('anvil', anvilArgs, {
        stdio: 'inherit'
    });
    
    anvilProcess.on('error', (err) => {
        error(`Failed to start Anvil: ${err.message}`);
    });
    
    anvilProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) {
            log(`\nAnvil exited with code ${code}`, 'yellow');
        }
    });
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        log('\n\n👋 Stopping Anvil...', 'yellow');
        if (anvilProcess) {
            anvilProcess.kill('SIGINT');
        }
        process.exit(0);
    });
}

// ============================================================================
// COMMAND: expose - Expose local Anvil via ngrok
// ============================================================================
function exposeAnvil() {
    log('\n🌐 Exposing Anvil via ngrok...', 'bright');
    
    try {
        // Check if ngrok is installed
        execSync('which ngrok', { stdio: 'ignore' });
    } catch (e) {
        error('ngrok is not installed. Install it from: https://ngrok.com/download');
    }
    
    info('Starting ngrok tunnel on port 8545...');
    
    const ngrokProcess = spawn('ngrok', ['http', '8545'], {
        stdio: 'inherit'
    });
    
    ngrokProcess.on('error', (err) => {
        error(`Failed to start ngrok: ${err.message}`);
    });
    
    process.on('SIGINT', () => {
        log('\n\n👋 Stopping ngrok...', 'yellow');
        ngrokProcess.kill('SIGINT');
        process.exit(0);
    });
}

// ============================================================================
// COMMAND: fund - Fund a wallet address
// ============================================================================
function fundWallet(address, amount) {
    if (!address || !amount) {
        error('Usage: x fund <address> <amount>');
    }
    
    log(`\n💰 Funding ${address} with ${amount}...`, 'bright');
    
    try {
        const cmd = `cast send ${address} --value ${amount} --rpc-url ${ANVIL_RPC} --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`;
        execSync(cmd, { stdio: 'inherit' });
        success(`Funded ${address} with ${amount}`);
    } catch (e) {
        error(`Failed to fund address: ${e.message}`);
    }
}

// ============================================================================
// COMMAND: balance - Check wallet balance
// ============================================================================
function checkBalance(address) {
    if (!address) {
        error('Usage: x balance <address>');
    }
    
    try {
        const balance = execSync(
            `cast balance ${address} --rpc-url ${ANVIL_RPC}`,
            { encoding: 'utf-8' }
        ).trim();
        
        const balanceEth = execSync(
            `cast to-unit ${balance} ether`,
            { encoding: 'utf-8' }
        ).trim();
        
        log(`\n💵 Balance of ${address}:`, 'bright');
        log(`   ${balanceEth} ETH`, 'green');
        log(`   ${balance} wei`, 'cyan');
    } catch (e) {
        error(`Failed to check balance: ${e.message}`);
    }
}

// ============================================================================
// COMMAND: accounts - List Anvil test accounts
// ============================================================================
function listAccounts() {
    log('\n👥 Anvil Test Accounts:', 'bright');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    
    const accounts = [
        { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' },
        { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', key: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' },
        { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', key: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a' },
    ];
    
    accounts.forEach((acc, i) => {
        log(`\nAccount #${i}:`, 'yellow');
        log(`  Address: ${acc.address}`, 'green');
        log(`  Key:     ${acc.key}`, 'cyan');
    });
    
    log('\n💡 Tip: Each account starts with 10,000 ETH on Anvil', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

// ============================================================================
// COMMAND: deploy - Deploy contracts to local Anvil
// ============================================================================
function deployContracts() {
    log('\n🚢 Deploying contracts to Anvil...', 'bright');
    
    try {
        const cmd = 'forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        execSync(cmd, { stdio: 'inherit' });
        success('Contracts deployed successfully!');
    } catch (e) {
        error(`Failed to deploy contracts: ${e.message}`);
    }
}

// ============================================================================
// COMMAND: send - Send transaction
// ============================================================================
function sendTransaction(to, data, value = '0') {
    if (!to) {
        error('Usage: x send <to> [data] [value]');
    }
    
    log(`\n📤 Sending transaction to ${to}...`, 'bright');
    
    try {
        let cmd = `cast send ${to} --rpc-url ${ANVIL_RPC} --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`;
        
        if (data) {
            cmd += ` "${data}"`;
        }
        if (value !== '0') {
            cmd += ` --value ${value}`;
        }
        
        execSync(cmd, { stdio: 'inherit' });
        success('Transaction sent successfully!');
    } catch (e) {
        error(`Failed to send transaction: ${e.message}`);
    }
}

// ============================================================================
// COMMAND: call - Call a contract function (read-only)
// ============================================================================
function callContract(address, sig, args = []) {
    if (!address || !sig) {
        error('Usage: x call <address> <signature> [args...]');
    }
    
    try {
        const argsStr = args.join(' ');
        const cmd = `cast call ${address} "${sig}" ${argsStr} --rpc-url ${ANVIL_RPC}`;
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        error(`Failed to call contract: ${e.message}`);
    }
}

// ============================================================================
// COMMAND: block - Get current block number
// ============================================================================
function getBlock() {
    try {
        const blockNumber = execSync(
            `cast block-number --rpc-url ${ANVIL_RPC}`,
            { encoding: 'utf-8' }
        ).trim();
        
        log(`\n🧱 Current block number: ${blockNumber}`, 'green');
    } catch (e) {
        error(`Failed to get block number: ${e.message}`);
    }
}

// ============================================================================
// COMMAND: help - Show help message
// ============================================================================
function showHelp() {
    log('\n╔══════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║                    Foundry Utils CLI v1.0                       ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════════════╝', 'cyan');
    log('\n📚 Available Commands:\n', 'bright');
    
    const commands = [
        { cmd: 'run [args]', desc: 'Start Anvil local blockchain' },
        { cmd: 'expose', desc: 'Expose Anvil via ngrok' },
        { cmd: 'fund <address> <amount>', desc: 'Fund a wallet (e.g., 10ether, 5gwei)' },
        { cmd: 'balance <address>', desc: 'Check wallet balance' },
        { cmd: 'accounts', desc: 'List Anvil test accounts' },
        { cmd: 'deploy', desc: 'Deploy contracts to local Anvil' },
        { cmd: 'send <to> [data] [value]', desc: 'Send a transaction' },
        { cmd: 'call <address> <sig> [args]', desc: 'Call contract function (read-only)' },
        { cmd: 'block', desc: 'Get current block number' },
        { cmd: 'help', desc: 'Show this help message' },
    ];
    
    commands.forEach(({ cmd, desc }) => {
        log(`  ${colors.green}x ${cmd.padEnd(30)}${colors.reset} ${desc}`);
    });
    
    log('\n💡 Examples:', 'yellow');
    log('  x run                                    # Start Anvil');
    log('  x fund 0xf39Fd...92266 10ether          # Fund with 10 ETH');
    log('  x balance 0xf39Fd...92266               # Check balance');
    log('  x deploy                                # Deploy contracts');
    log('  x call 0x123... "totalSupply()"         # Call contract');
    log('  x send 0x123... "transfer(address,uint256)" 0x456... 100');
    log('');
}

// ============================================================================
// Main CLI Router
// ============================================================================
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command || command === 'help' || command === '--help' || command === '-h') {
        showHelp();
        return;
    }
    
    switch (command) {
        case 'run':
            runAnvil(args.slice(1));
            break;
            
        case 'expose':
            exposeAnvil();
            break;
            
        case 'fund':
            fundWallet(args[1], args[2]);
            break;
            
        case 'balance':
        case 'bal':
            checkBalance(args[1]);
            break;
            
        case 'accounts':
        case 'accs':
            listAccounts();
            break;
            
        case 'deploy':
            deployContracts();
            break;
            
        case 'send':
            sendTransaction(args[1], args[2], args[3]);
            break;
            
        case 'call':
            callContract(args[1], args[2], args.slice(3));
            break;
            
        case 'block':
            getBlock();
            break;
            
        default:
            error(`Unknown command: ${command}\n`);
            showHelp();
    }
}

// Run CLI
if (require.main === module) {
    main();
}

module.exports = { main };

