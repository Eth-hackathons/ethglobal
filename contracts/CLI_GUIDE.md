# Foundry Utils CLI Guide

A simple command-line tool to make local blockchain testing easier with Anvil.

## 🚀 Quick Start

### Option 1: Direct Usage (No Installation)

```bash
# From the contracts directory
node cli.js <command> [args]

# Or use npm script
npm run x <command> [args]
```

### Option 2: Install Globally (Recommended)

```bash
# From contracts directory
npm link

# Now use 'x' anywhere!
x run
x accounts
x fund 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 5ether
```

### Option 3: Create Alias

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
alias x='node /Users/viniciusassis/Developer/Hackatons/chiss/contracts/cli.js'
```

Then reload: `source ~/.zshrc`

---

## 📚 Commands

### `x run` - Start Anvil

Start a local Ethereum blockchain with Anvil.

```bash
x run

# With custom options
x run --block-time 2 --accounts 20
```

**What it does:**
- Starts Anvil on `http://localhost:8545`
- Chain ID: 31337
- 10 pre-funded accounts with 10,000 ETH each
- Press Ctrl+C to stop

---

### `x expose` - Expose via ngrok

Expose your local Anvil to the internet using ngrok.

```bash
x expose
```

**Requirements:**
- Install ngrok: `brew install ngrok` or from https://ngrok.com/download

**Use case:**
- Test with mobile wallets
- Share blockchain with team members
- Connect from external services

---

### `x fund <address> <amount>` - Fund Wallet

Send ETH to any address.

```bash
x fund 0xYourAddress 10ether
x fund 0xYourAddress 5000000gwei
x fund 0xYourAddress 1000000000000000000
```

**Supported units:**
- `ether`, `eth`
- `gwei`
- `wei` (raw number)

---

### `x balance <address>` - Check Balance

Check the balance of any address.

```bash
x balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Alias
x bal 0xYourAddress
```

**Output:**
- Balance in ETH
- Balance in wei

---

### `x accounts` - List Test Accounts

Show all Anvil test accounts with their private keys.

```bash
x accounts

# Alias
x accs
```

**Output:**
- 3 main test accounts
- Addresses and private keys
- Copy-paste ready for MetaMask

---

### `x deploy` - Deploy Contracts

Deploy all contracts to local Anvil.

```bash
x deploy
```

**What it does:**
- Runs `forge script script/Deploy.s.sol`
- Uses first Anvil account
- Broadcasts transactions
- Shows deployed addresses

---

### `x send <to> [data] [value]` - Send Transaction

Send a transaction to an address or contract.

```bash
# Simple transfer
x send 0xRecipient "" 1ether

# Call contract function
x send 0xContractAddress "registerCreator(string,string)" "MyName" "ipfs://metadata"

# With value
x send 0xContractAddress "stake(uint8)" 0 --value 2ether
```

---

### `x call <address> <signature> [args]` - Call Contract

Call a read-only contract function.

```bash
x call 0xHubAddress "getAllMarkets()"
x call 0xMarketAddress "getStake(address,uint8)" 0xUserAddress 0
x call 0xHubAddress "isCreator(address)" 0xAddress
```

**Note:** This doesn't cost gas (read-only).

---

### `x block` - Get Block Number

Show current block number.

```bash
x block
```

---

### `x help` - Show Help

Display all available commands.

```bash
x help
x --help
x -h
```

---

## 💡 Common Workflows

### 1. Start Fresh Local Blockchain

```bash
# Terminal 1: Start Anvil
x run

# Terminal 2: Deploy contracts
x deploy

# Terminal 3: Extract ABIs
npm run extract-abi
```

### 2. Test Creator Registration

```bash
# Start Anvil
x run

# In another terminal
x deploy

# Get hub address from deployment output
HUB=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Register as creator
x send $HUB "registerCreator(string,string)" "Alice" "ipfs://alice"

# Check if registered
x call $HUB "isCreator(address)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### 3. Create and Fund a Market

```bash
# Create market
x send $HUB "createMarket(string,string,uint256)" "pm-123" "ETH to 5k?" 1735689600

# Get market address from event logs
MARKET=0xNewMarketAddress

# User stakes on outcome A
x send $MARKET "stake(uint8)" 0 --value 2ether

# Check pool info
x call $MARKET "getPoolInfo()"
```

### 4. Expose for Mobile Testing

```bash
# Terminal 1
x run

# Terminal 2
x expose

# Copy ngrok URL and use in mobile wallet
```

---

## 🔧 Configuration

### Default Settings

```javascript
RPC URL: http://localhost:8545
Chain ID: 31337
Default Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Anvil Test Accounts

| # | Address | Private Key | Balance |
|---|---------|-------------|---------|
| 0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974...` | 10,000 ETH |
| 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c699...` | 10,000 ETH |
| 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de411...` | 10,000 ETH |

---

## 🐛 Troubleshooting

### "Command not found: x"

**Solution 1:** Use direct path
```bash
node /path/to/contracts/cli.js run
```

**Solution 2:** Run `npm link` from contracts directory

**Solution 3:** Create an alias in your shell config

### "cast: command not found"

Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### "Connection refused"

Make sure Anvil is running:
```bash
x run
```

### "ngrok not found"

Install ngrok:
```bash
# macOS
brew install ngrok

# Or download from
https://ngrok.com/download
```

---

## 📝 Tips

1. **Keep Anvil Running:** Leave `x run` running in a dedicated terminal
2. **Use Account Aliases:** Create shortcuts for frequently used addresses
3. **Save Deployment Addresses:** Keep a note of deployed contract addresses
4. **Watch Gas:** Anvil shows gas used for each transaction
5. **Reset State:** Restart Anvil to reset blockchain state

---

## 🔮 Future Commands (Coming Soon)

- `x snapshot` - Save blockchain state
- `x restore` - Restore from snapshot
- `x impersonate <address>` - Impersonate any address
- `x mine <blocks>` - Mine blocks
- `x time <seconds>` - Fast forward time
- `x logs <address>` - Watch contract events
- `x decode <data>` - Decode transaction data

---

## 🆘 Need Help?

Run `x help` to see all commands, or check the examples above!

**Happy Testing! 🚀**

