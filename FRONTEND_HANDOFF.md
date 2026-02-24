# Frontend Handoff (Simple)

Use this plan:
- `MIGRATION_PLAN.md`

Work only in:
- `ui/`

Use ABIs from:
- `contracts/ABI/`

<!-- ## 1) Fast contract checks (no Anvil)

```bash
cd /Users/viniciusassis/Developer/ethglobal/contracts
forge test
``` -->

## 2) Local chain for full UI flow

Terminal 1:
```bash
anvil
```

Terminal 2:
```bash
cd /Users/viniciusassis/Developer/ethglobal/contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

Then:
1. Copy deployed addresses.
2. Set `ui` contract addresses to those local addresses.
3. Run UI and test full flow (create community, create/import market, stake, trigger, settle, claim).
