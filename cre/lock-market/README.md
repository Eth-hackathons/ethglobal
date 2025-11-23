# Lock Market Workflow

This CRE workflow calls the Next.js API endpoint `/api/market/lock` to lock a market by triggering execution with a chosen outcome.

## Overview

This workflow:
- Runs on a cron schedule
- Calls the Next.js API to lock a market
- Uses `cacheSettings` to ensure only one node makes the HTTP call (single-execution pattern)
- Validates the response and logs the transaction hash

## Configuration

Update `config.staging.json` and `config.production.json` with:

```json
{
  "apiUrl": "https://your-nextjs-app-url.vercel.app/api/market/lock",
  "schedule": "*/30 * * * * *",
  "marketAddress": "0x...",
  "outcome": 0
}
```

### Configuration Fields

- `apiUrl`: The full URL to your Next.js API endpoint (e.g., `https://your-app.vercel.app/api/market/lock`)
- `schedule`: Cron expression for when to run (e.g., `*/30 * * * * *` = every 30 seconds)
- `marketAddress`: The address of the Market contract to lock
- `outcome`: The outcome to choose (0 = A, 1 = B, 2 = Draw)

## Setup

### 1. Update .env file

You need to add a private key to env file. This is specifically required if you want to simulate chain writes. For that to work the key should be valid and funded.
If your workflow does not do any chain write then you can just put any dummy key as a private key. e.g.

```
CRE_ETH_PRIVATE_KEY=0000000000000000000000000000000000000000000000000000000000000001
```

### 2. Install dependencies

If `bun` is not already installed, see https://bun.com/docs/installation for installing in your environment.

```bash
cd cre/lock-market && bun install
```

### 3. Update config files

Edit `config.staging.json` and `config.production.json`:
- Set `apiUrl` to your deployed Next.js API URL
- Set `marketAddress` to the Market contract address you want to lock
- Set `outcome` to the desired outcome (0, 1, or 2)

### 4. Simulate the workflow

Run the command from <b>project root directory</b>

```bash
cre workflow simulate ./cre/lock-market --target=staging-settings
```

## API Endpoint

The workflow calls `POST /api/market/lock` with:

```json
{
  "marketAddress": "0x...",
  "outcome": 0
}
```

Expected response:
```json
{
  "success": true,
  "txHash": "0x...",
  "blockNumber": "12345",
  "status": "success"
}
```

## How It Works

1. **Cron Trigger**: The workflow runs on the configured schedule
2. **HTTP Request**: Makes a POST request to the Next.js API endpoint
3. **Cache Settings**: Uses `cacheSettings` to ensure only one node makes the actual HTTP call
4. **Response Handling**: Parses the response and logs the transaction hash
5. **Error Handling**: Throws an error if the API call fails or returns an error

## Single-Execution Pattern

This workflow uses the `cacheSettings` pattern to ensure only one node in the DON makes the actual HTTP call:
- First node makes the request and caches the response
- Other nodes check the cache and reuse the cached response
- Result: Only one actual HTTP call is made, while all nodes participate in consensus

This is essential for POST requests that trigger actions (like locking a market) to prevent duplicate executions.
