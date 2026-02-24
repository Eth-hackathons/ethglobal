# UI Integration Plan (`ui/` only)

Last updated: 2026-02-24

## Goal

Integrate all product functionality directly into `ui/` (wallet, contracts, API routes, comments, creator execution), replacing mock data with live data and transactions.

## Integration Blueprint (Quick Pass Findings)

The existing implementation patterns to reproduce in `ui/` are:
- Wallet + chain stack: `wagmi` + `viem` + `@rainbow-me/rainbowkit` + `@tanstack/react-query`
- Chain config for Chiliz Spicy testnet (`88882`)
- Reusable hooks for reads/writes:
  - `useContractRead`, `useContractReads`
  - `useContractWrite` with receipt tracking
- API routes:
  - `POST /api/market/lock`
  - `POST /api/market/submit-results`
  - `GET/POST /api/comments`
  - `GET /api/polymarket/events/[slug]`
- Contract assets:
  - ABIs for `PredictionHub`, `Market`
  - centralized contract addresses

## Step-by-Step Plan

1. Define feature parity checklist
- Lock MVP scope: home, communities list/detail, market detail, dashboard, creator actions.
- For each route, list required live behaviors and acceptance criteria.
- Output: `PARITY_CHECKLIST.md`.

2. Add missing runtime dependencies to `ui/`
- Add: `wagmi`, `viem`, `@rainbow-me/rainbowkit`, `@tanstack/react-query`, `@supabase/supabase-js`.
- Keep versions compatible with `Next 16` + `React 19`.
- Validate install and type resolution.

3. Create blockchain foundation in `ui/lib`
- Add `ui/lib/chains.ts` for Spicy testnet.
- Add `ui/lib/wagmi.ts` with RainbowKit/wagmi config.
- Add `ui/lib/contracts.ts` with deployed addresses.
- Add `ui/lib/abis/*` from `contracts/ABI`.

4. Add providers to app root
- Create `ui/app/providers.tsx`:
  - `WagmiProvider`
  - `QueryClientProvider`
  - `RainbowKitProvider`
  - existing toaster providers
- Wrap children in `ui/app/layout.tsx`.

5. Implement reusable contract hooks
- Add `ui/hooks/useContractRead.ts`.
- Add `ui/hooks/useContractWrite.ts`.
- Add helper hooks for read/write client access.
- Standardize return shape: loading, error, tx hash, receipt, canWrite.

6. Replace mock wallet UX in navigation
- Wire connect/disconnect with RainbowKit.
- Show real wallet address, network status, and CHZ balance.
- Disable action buttons when wallet/chain state is invalid.

7. Integrate communities list route
- Replace `mockCommunitiesList` with onchain reads:
  - `communityCount`
  - `communities(i)`
- Map data to existing UI card shape and preserve sorting/filtering UX.

8. Integrate community detail route
- Resolve route param to community id strategy (`slug` vs id).
- Read community + market addresses from `PredictionHub`.
- Read each market summary for grid cards/status.
- Replace local join/leave toggle with real writes:
  - `joinCommunity`
  - `leaveCommunity`

9. Integrate market detail route
- Replace `mockMarket`, `mockUserStake`, `mockClaimReward`, `mockComments`.
- Wire contract reads:
  - metadata, deadline, state, pools, chosen/winning outcome, user stakes
- Wire contract writes:
  - `stake(outcome)` + value
  - `claim()`
- Preserve loading/error/confirming UX.

10. Normalize outcome model in UI
- Protocol supports `A/B/Draw`; current UI mostly shows `YES/NO`.
- Implement explicit mapping layer:
  - display labels (`Yes/No/Draw` or sport-specific labels)
  - write/read enum conversion
- Ensure Draw flow is not dropped.

11. Integrate Polymarket import flow
- Replace simulated URL parsing/fetching with live proxy endpoint.
- Implement `GET /api/polymarket/events/[slug]`.
- Wire dialog to call API and then `createMarket(...)`.

12. Add creator execution endpoints in `ui/app/api`
- Add `POST /api/market/lock` using server wallet key.
- Add `POST /api/market/submit-results`.
- Validate request schemas, input ranges, and error responses.

13. Integrate comments backend
- Add `ui/lib/supabase.ts`.
- Add `GET/POST /api/comments`.
- Wire discussion component to API for read/create comment flows.

14. Environment and secrets setup
- Add/update `.env.local.example` for:
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
  - `CREATOR_PRIVATE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Ensure server-only keys are never exposed to client.

15. Execution controls and fallback policy UX
- Add creator controls in market/community surfaces:
  - manual execution action
  - clear status of auto-fallback at `T-10m`
  - cancel action with constraints (time window, auditability)
- Keep behavior aligned with current product decisions in README.

16. QA and release hardening
- Run lint/build/typecheck.
- Perform full manual flow on Spicy testnet:
  - register creator
  - create community
  - import/create market
  - stake
  - trigger execution
  - submit results
  - claim
- Verify mobile/tablet/desktop and error states.

17. Remove mock-only paths
- Delete or quarantine `ui/lib/data/mock-*` usage from production routes.
- Keep mocks only in isolated showcase/story/demo components if needed.

## Execution Order (Recommended)

1. Steps 1-5 (foundation)
2. Steps 6-8 (wallet + community surfaces)
3. Steps 9-10 (market core logic)
4. Steps 11-13 (API integrations)
5. Steps 14-17 (hardening + cleanup)

## Estimated Effort

- MVP live integration: 5-7 days
- Full parity + polish: 7-10 days

## Non-Goals

- Contract architecture redesign beyond required UI/API wiring
- Large visual redesign during integration phase
- Non-essential feature expansion before core flow is stable
