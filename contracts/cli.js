#!/usr/bin/env node
/**
 * Prediction Hub CLI - Local Development Utilities
 * 
 * Usage: node cli.js <command> [options]
 * 
 * Commands:
 *   run         - Start Anvil local blockchain
 *   expose      - Expose Anvil via ngrok
 *   fund        - Fund a wallet with ETH
 *   deploy      - Deploy all contracts
 *   accounts    - List available accounts
 *   balance     - Check balance of an address
 *   register    - Register as a creator
 *   market      - Create a market
 *   stake       - Stake on an outcome
 *   trigger     - Trigger market execution
 *   settle      - Settle a market (mock)
 *   claim       - Claim winnings
 *   status      - Get contract/market status
 *   reset       - Kill Anvil and restart
 */

const { execSync, spawn } = require('child_process');
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
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
    log(`❌ ${message}`, 'red');
    process.exit(1);
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function warn(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// Config file for deployed addresses
const CONFIG_FILE = path.join(__dirname, '.cli-config.json');

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
    return {};
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Anvil default accounts
const ANVIL_ACCOUNTS = [
    { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' },
    { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', key: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' },
    { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', key: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a' },
    { address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', key: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6' },
    { address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', key: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a' },
];

// Commands

async function runAnvil() {
    log('\n🔨 Starting Anvil local blockchain...', 'bright');
    info('Default RPC: http://localhost:8545');
    info('Chain ID: 31337\n');
    
    log('Available Accounts:', 'cyan');
    ANVIL_ACCOUNTS.slice(0, 3).forEach((acc, i) => {
        console.log(`  ${i}: ${acc.address} (10000 ETH)`);
    });
    console.log(`  ... and ${ANVIL_ACCOUNTS.length - 3} more\n`);
    
    info('Press Ctrl+C to stop Anvil\n');
    
    const anvil = spawn('anvil', [], {
        stdio: 'inherit',
        shell: true
    });
    
    anvil.on('error', (err) => {
        error('Failed to start Anvil. Make sure Foundry is installed.');
    });
}

async function exposeAnvil() {
    log('\n🌐 Exposing Anvil via ngrok...', 'bright');
    
    try {
        // Check if ngrok is installed
        execSync('which ngrok', { stdio: 'ignore' });
    } catch {
        error('ngrok is not installed. Install it from: https://ngrok.com/download');
    }
    
    info('Starting ngrok tunnel to http://localhost:8545\n');
    
    const ngrok = spawn('ngrok', ['http', '8545'], {
        stdio: 'inherit',
        shell: true
    });
    
    ngrok.on('error', (err) => {
        error('Failed to start ngrok.');
    });
}

function fundWallet(address, amount) {
    log(`\n💰 Funding ${address} with ${amount}...`, 'bright');
    
    if (!address || !amount) {
        error('Usage: node cli.js fund <address> <amount>\nExample: node cli.js fund 0x123... 10');
    }
    
    // Parse amount (support 10eth, 10, etc)
    const amountStr = amount.toLowerCase().replace('eth', '').trim();
    
    try {
        const cmd = `cast send ${address} --value ${amountStr}ether --private-key ${ANVIL_ACCOUNTS[0].key} --rpc-url http://localhost:8545`;
        execSync(cmd, { stdio: 'inherit' });
        success(`Funded ${address} with ${amountStr} ETH`);
    } catch (err) {
        error('Failed to fund wallet. Is Anvil running?');
    }
}

function getBalance(address) {
    if (!address) {
        // Show all default accounts
        log('\n💰 Account Balances:', 'bright');
        ANVIL_ACCOUNTS.forEach((acc, i) => {
            try {
                const balance = execSync(
                    `cast balance ${acc.address} --rpc-url http://localhost:8545`,
                    { encoding: 'utf8' }
                ).trim();
                const eth = (BigInt(balance) / BigInt(10**18)).toString();
                console.log(`  ${i}: ${acc.address.slice(0, 10)}... ${eth} ETH`);
            } catch {}
        });
        console.log();
    } else {
        try {
            const balance = execSync(
                `cast balance ${address} --rpc-url http://localhost:8545`,
                { encoding: 'utf8' }
            ).trim();
            const eth = (BigInt(balance) / BigInt(10**18)).toString();
            log(`\n💰 Balance: ${eth} ETH\n`, 'green');
        } catch {
            error('Failed to get balance. Is Anvil running?');
        }
    }
}

function listAccounts() {
    log('\n👥 Available Accounts:', 'bright');
    console.log();
    ANVIL_ACCOUNTS.forEach((acc, i) => {
        console.log(`${colors.cyan}Account ${i}:${colors.reset}`);
        console.log(`  Address: ${acc.address}`);
        console.log(`  Private: ${acc.key}`);
        console.log();
    });
}

async function deployContracts() {
    log('\n🚀 Deploying contracts to Anvil...', 'bright');
    
    try {
        const result = execSync(
            `forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast --private-key ${ANVIL_ACCOUNTS[0].key}`,
            { encoding: 'utf8' }
        );
        
        // Extract addresses from output
        const hubMatch = result.match(/PredictionHub deployed at: (0x[a-fA-F0-9]{40})/);
        const configMatch = result.match(/NetworkConfig deployed at: (0x[a-fA-F0-9]{40})/);
        const mockMatch = result.match(/MockPolymarket deployed at: (0x[a-fA-F0-9]{40})/);
        
        if (hubMatch && configMatch && mockMatch) {
            const config = {
                networkConfig: configMatch[1],
                mockPolymarket: mockMatch[1],
                predictionHub: hubMatch[1],
                deployedAt: new Date().toISOString()
            };
            
            saveConfig(config);
            
            success('Contracts deployed successfully!\n');
            log('📋 Deployed Addresses:', 'cyan');
            console.log(`  NetworkConfig: ${config.networkConfig}`);
            console.log(`  MockPolymarket: ${config.mockPolymarket}`);
            console.log(`  PredictionHub: ${config.predictionHub}`);
            console.log();
        }
    } catch (err) {
        error('Deployment failed. Is Anvil running?');
    }
}

function registerCreator(name, metadata) {
    log(`\n👤 Registering creator "${name}"...`, 'bright');
    
    const config = loadConfig();
    if (!config.predictionHub) {
        error('No deployed contracts found. Run: node cli.js deploy');
    }
    
    const metadataUri = metadata || 'ipfs://QmDefault';
    
    try {
        execSync(
            `cast send ${config.predictionHub} "registerCreator(string,string)" "${name}" "${metadataUri}" --private-key ${ANVIL_ACCOUNTS[0].key} --rpc-url http://localhost:8545`,
            { stdio: 'inherit' }
        );
        success(`Registered creator: ${name}`);
    } catch {
        error('Failed to register creator');
    }
}

function createMarket(polymarketId, description, daysFromNow) {
    log(`\n📊 Creating market...`, 'bright');
    
    const config = loadConfig();
    if (!config.predictionHub) {
        error('No deployed contracts found. Run: node cli.js deploy');
    }
    
    const days = parseInt(daysFromNow) || 7;
    const deadline = Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);
    
    try {
        const result = execSync(
            `cast send ${config.predictionHub} "createMarket(string,string,uint256)(address)" "${polymarketId}" "${description}" ${deadline} --private-key ${ANVIL_ACCOUNTS[0].key} --rpc-url http://localhost:8545`,
            { encoding: 'utf8' }
        );
        
        success('Market created!');
        info(`Staking deadline: ${new Date(deadline * 1000).toLocaleString()}`);
        
        // Try to extract market address from logs
        const addressMatch = result.match(/0x[a-fA-F0-9]{40}/);
        if (addressMatch) {
            console.log(`\nMarket Address: ${addressMatch[0]}`);
        }
    } catch {
        error('Failed to create market. Are you registered as a creator?');
    }
}

function stakeOnMarket(marketAddress, outcome, amount, accountIndex = 0) {
    log(`\n🎲 Staking ${amount} ETH on outcome ${outcome}...`, 'bright');
    
    if (!marketAddress || outcome === undefined || !amount) {
        error('Usage: node cli.js stake <market-address> <outcome> <amount> [account]\nOutcomes: 0=A, 1=B, 2=Draw\nExample: node cli.js stake 0x123... 0 1');
    }
    
    const account = ANVIL_ACCOUNTS[parseInt(accountIndex) || 0];
    const amountStr = amount.toString().replace('eth', '').trim();
    
    try {
        execSync(
            `cast send ${marketAddress} "stake(uint8)" ${outcome} --value ${amountStr}ether --private-key ${account.key} --rpc-url http://localhost:8545`,
            { stdio: 'inherit' }
        );
        success(`Staked ${amountStr} ETH on outcome ${outcome}`);
    } catch {
        error('Failed to stake');
    }
}

function getStatus(marketAddress) {
    log('\n📊 Contract Status:', 'bright');
    
    const config = loadConfig();
    
    if (config.predictionHub) {
        console.log(`\n${colors.cyan}PredictionHub:${colors.reset} ${config.predictionHub}`);
        
        try {
            const stats = execSync(
                `cast call ${config.predictionHub} "getHubStats()(uint256,uint256,uint256)" --rpc-url http://localhost:8545`,
                { encoding: 'utf8' }
            ).trim();
            
            const [creators, markets, tvl] = stats.split('\n');
            console.log(`  Creators: ${creators}`);
            console.log(`  Markets: ${markets}`);
            console.log(`  TVL: ${BigInt(tvl) / BigInt(10**18)} ETH`);
        } catch {}
    }
    
    if (marketAddress) {
        console.log(`\n${colors.cyan}Market:${colors.reset} ${marketAddress}`);
        
        try {
            const poolInfo = execSync(
                `cast call ${marketAddress} "getPoolInfo()(uint256,uint256,uint256)" --rpc-url http://localhost:8545`,
                { encoding: 'utf8' }
            ).trim().split('\n');
            
            console.log(`  Outcome A: ${BigInt(poolInfo[0]) / BigInt(10**18)} ETH`);
            console.log(`  Outcome B: ${BigInt(poolInfo[1]) / BigInt(10**18)} ETH`);
            console.log(`  Draw: ${BigInt(poolInfo[2]) / BigInt(10**18)} ETH`);
            
            const state = execSync(
                `cast call ${marketAddress} "state()(uint8)" --rpc-url http://localhost:8545`,
                { encoding: 'utf8' }
            ).trim();
            
            const states = ['Open', 'Locked', 'MockBridged', 'MockTrading', 'Settled', 'Completed'];
            console.log(`  State: ${states[parseInt(state)]}`);
        } catch {}
    }
    console.log();
}

function triggerMarket(marketAddress, outcome) {
    log(`\n⚡ Triggering market execution with outcome ${outcome}...`, 'bright');
    
    if (!marketAddress || outcome === undefined) {
        error('Usage: node cli.js trigger <market-address> <outcome>\nOutcomes: 0=A, 1=B, 2=Draw');
    }
    
    try {
        execSync(
            `cast send ${marketAddress} "triggerExecution(uint8)" ${outcome} --private-key ${ANVIL_ACCOUNTS[0].key} --rpc-url http://localhost:8545`,
            { stdio: 'inherit' }
        );
        success('Market triggered!');
        info('Market is now in MockTrading state');
    } catch {
        error('Failed to trigger market. Are you the creator?');
    }
}

function settleMarket(marketAddress, winningOutcome, payoutEth) {
    log(`\n🏁 Settling market with winner: ${winningOutcome}...`, 'bright');
    
    if (!marketAddress || winningOutcome === undefined || !payoutEth) {
        error('Usage: node cli.js settle <market-address> <winning-outcome> <payout-eth>\nExample: node cli.js settle 0x123... 0 10');
    }
    
    const config = loadConfig();
    const payoutWei = BigInt(parseFloat(payoutEth) * 10**18).toString();
    
    try {
        execSync(
            `cast send ${marketAddress} "mockPolymarketReturn(uint8,uint256)" ${winningOutcome} ${payoutWei} --value ${payoutEth}ether --private-key ${ANVIL_ACCOUNTS[0].key} --rpc-url http://localhost:8545`,
            { stdio: 'inherit' }
        );
        success('Market settled!');
        info(`Winning outcome: ${winningOutcome}`);
        info(`Payout: ${payoutEth} ETH`);
        info('Winners can now claim rewards');
    } catch {
        error('Failed to settle market');
    }
}

function claimRewards(marketAddress, accountIndex = 0) {
    log(`\n🎁 Claiming rewards...`, 'bright');
    
    if (!marketAddress) {
        error('Usage: node cli.js claim <market-address> [account]\nExample: node cli.js claim 0x123... 0');
    }
    
    const account = ANVIL_ACCOUNTS[parseInt(accountIndex) || 0];
    
    try {
        // Check if can claim
        const canClaim = execSync(
            `cast call ${marketAddress} "canClaim(address)(bool)" ${account.address} --rpc-url http://localhost:8545`,
            { encoding: 'utf8' }
        ).trim();
        
        if (canClaim === 'false') {
            warn('You cannot claim from this market (not a winner or already claimed)');
            return;
        }
        
        // Get potential reward
        const reward = execSync(
            `cast call ${marketAddress} "getPotentialReward(address)(uint256)" ${account.address} --rpc-url http://localhost:8545`,
            { encoding: 'utf8' }
        ).trim();
        
        const rewardEth = (BigInt(reward) / BigInt(10**18)).toString();
        info(`Potential reward: ${rewardEth} ETH`);
        
        // Claim
        execSync(
            `cast send ${marketAddress} "claim()" --private-key ${account.key} --rpc-url http://localhost:8545`,
            { stdio: 'inherit' }
        );
        
        success(`Claimed ${rewardEth} ETH!`);
    } catch {
        error('Failed to claim rewards');
    }
}

function resetBlockchain() {
    log('\n🔄 Resetting Anvil...', 'bright');
    
    try {
        // Kill anvil processes
        execSync('pkill -9 anvil', { stdio: 'ignore' });
        success('Anvil stopped');
        
        // Remove config
        if (fs.existsSync(CONFIG_FILE)) {
            fs.unlinkSync(CONFIG_FILE);
            info('Config cleared');
        }
        
        info('Run "node cli.js run" to start fresh');
    } catch {
        warn('No Anvil process found');
    }
}

function showHelp() {
    console.log(`
${colors.bright}Prediction Hub CLI - Local Development Utilities${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node cli.js <command> [options]

${colors.cyan}Blockchain Commands:${colors.reset}
  ${colors.green}run${colors.reset}                      - Start Anvil local blockchain
  ${colors.green}expose${colors.reset}                   - Expose Anvil via ngrok
  ${colors.green}reset${colors.reset}                    - Kill Anvil and reset config
  ${colors.green}accounts${colors.reset}                 - List available test accounts
  ${colors.green}balance${colors.reset} [address]        - Check balance of address (or all accounts)
  ${colors.green}fund${colors.reset} <address> <amount>  - Fund a wallet with ETH
    Example: node cli.js fund 0x123... 10

${colors.cyan}Contract Commands:${colors.reset}
  ${colors.green}deploy${colors.reset}                   - Deploy all contracts to Anvil
  ${colors.green}status${colors.reset} [market]          - Show contract/market status
    Example: node cli.js status 0x123...

${colors.cyan}Creator Commands:${colors.reset}
  ${colors.green}register${colors.reset} <name> [uri]    - Register as a creator
    Example: node cli.js register "Alice" "ipfs://..."
  
  ${colors.green}market${colors.reset} <id> <desc> [days] - Create a market
    Example: node cli.js market "pm-123" "ETH to 5k?" 7

${colors.cyan}User Commands:${colors.reset}
  ${colors.green}stake${colors.reset} <market> <outcome> <amount> [account]
    - Stake on a market outcome (0=A, 1=B, 2=Draw)
    Example: node cli.js stake 0x123... 0 1.5 0
  
  ${colors.green}claim${colors.reset} <market> [account]  - Claim winnings from market
    Example: node cli.js claim 0x123... 0

${colors.cyan}Testing Commands:${colors.reset}
  ${colors.green}trigger${colors.reset} <market> <outcome> - Creator triggers execution
    Example: node cli.js trigger 0x123... 0
  
  ${colors.green}settle${colors.reset} <market> <winner> <payout> - Settle market (mock)
    Example: node cli.js settle 0x123... 0 10

${colors.cyan}Examples:${colors.reset}
  # Start fresh
  node cli.js run
  
  # In another terminal
  node cli.js deploy
  node cli.js register "Alice"
  node cli.js market "pm-123" "ETH to 5k?" 7
  node cli.js stake <market-addr> 0 5 0
  node cli.js status <market-addr>

${colors.cyan}Config File:${colors.reset}
  Deployed addresses stored in: .cli-config.json
`);
}

// Main CLI handler
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
    case 'run':
        runAnvil();
        break;
    case 'expose':
        exposeAnvil();
        break;
    case 'fund':
        fundWallet(args[0], args[1]);
        break;
    case 'balance':
        getBalance(args[0]);
        break;
    case 'accounts':
        listAccounts();
        break;
    case 'deploy':
        deployContracts();
        break;
    case 'register':
        registerCreator(args[0], args[1]);
        break;
    case 'market':
    case 'create-market':
        createMarket(args[0], args[1], args[2]);
        break;
    case 'stake':
        stakeOnMarket(args[0], args[1], args[2], args[3]);
        break;
    case 'trigger':
        triggerMarket(args[0], args[1]);
        break;
    case 'settle':
        settleMarket(args[0], args[1], args[2]);
        break;
    case 'claim':
        claimRewards(args[0], args[1]);
        break;
    case 'status':
        getStatus(args[0]);
        break;
    case 'reset':
        resetBlockchain();
        break;
    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;
    default:
        if (!command) {
            showHelp();
        } else {
            error(`Unknown command: ${command}\n\nRun "node cli.js help" for usage`);
        }
}

