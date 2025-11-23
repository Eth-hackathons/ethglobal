# Prediction Hub CLI - Quick Reference

## Essential Commands

```bash
# START BLOCKCHAIN
node cli.js run

# DEPLOY
node cli.js deploy

# REGISTER CREATOR
node cli.js register "Your Name"

# CREATE MARKET
node cli.js market "pm-id" "Description?" 7

# STAKE (outcomes: 0=A, 1=B, 2=Draw)
node cli.js stake <market> <outcome> <amount> [account]

# STATUS
node cli.js status [market]

# TRIGGER (creator only)
node cli.js trigger <market> <outcome>

# SETTLE (testing)
node cli.js settle <market> <winner> <payout>

# CLAIM
node cli.js claim <market> [account]
```

## Useful Commands

```bash
node cli.js accounts      # List accounts
node cli.js balance       # Check balances
node cli.js fund 0x... 10 # Fund wallet
node cli.js expose        # Expose via ngrok
node cli.js reset         # Reset everything
node cli.js help          # Full help
```

## Complete Flow Example

```bash
# Terminal 1
node cli.js run

# Terminal 2
node cli.js deploy
node cli.js register "Alice"
node cli.js market "pm-123" "ETH to $5k?" 7
# Save market address: MARKET=0x...

node cli.js stake $MARKET 0 5 0  # Alice: 5 ETH on A
node cli.js stake $MARKET 1 3 1  # Bob: 3 ETH on B
node cli.js status $MARKET

node cli.js trigger $MARKET 0    # Bet on A
node cli.js settle $MARKET 0 10  # A wins, 10 ETH
node cli.js claim $MARKET 0      # Alice claims
```

## Account Indices

```
0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
4: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
... and 5 more
```

## Outcomes

```
0 = A (Team A wins, Yes, etc.)
1 = B (Team B wins, No, etc.)
2 = Draw (Tie, Neither, etc.)
```

## NPM Shortcuts

```bash
npm run anvil        # Start Anvil
npm run cli -- help  # Run CLI with args
npm run dev:setup    # Deploy + Register
```

## Config File

Deployment addresses saved in: `.cli-config.json`

## Need Help?

```bash
node cli.js help         # Full command list
cat CLI_GUIDE.md         # Complete guide
cat README.md            # Project docs
```

