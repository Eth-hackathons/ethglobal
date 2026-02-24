# Hackathon Delivery Plan: Predít Rebrand & Core Features

This ExecPlan is a living document maintained according to `/Users/viniciusassis/Developer/ethglobal/PLANS.md`. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

## Purpose / Big Picture

Transform the current Predít prototype into a polished, hackathon-ready submission for the Chainlink Hackathon (https://chain.link/hackathon). The deliverable enables community-driven sports prediction markets: a creator imports a Polymarket market, their community stakes CHZ on outcomes, the creator triggers execution of the community's collective bet, and winners claim proportional rewards after the market resolves.

After this work, someone can: (1) visit the redesigned UI, (2) create a community and import a real Polymarket market, (3) stake CHZ on an outcome, (4) see the creator trigger execution via the fixed Chainlink CRE workflow, (5) observe the bet placement on Polymarket's native chain, and (6) claim rewards if their outcome wins.

## Progress

- [ ] Research and select new project name (3-5 options with domain availability check)
- [ ] Decide on CHZ handling strategy (native vs instant conversion to stable)
- [ ] Audit and document current CRE integration breakage
- [x] (2026-02-23) Created detailed v0 design prompts for all major UI components (V0_PROMPTS.md)
- [ ] Generate UI components using v0.dev (Landing, Market Detail, Creator Dashboard, Community Feed, Header, Staking Modal)
- [ ] Update Tailwind config with white/orange color system
- [ ] Integrate generated components into Next.js frontend
- [ ] Connect new UI components to existing contract hooks
- [ ] Test responsive design across mobile/tablet/desktop
- [ ] Fix Chainlink CRE lock-market workflow
- [ ] Implement Polymarket execution layer (API integration or relay service)
- [ ] Update contracts to support chosen CHZ handling strategy
- [ ] Write end-to-end integration test
- [ ] Deploy to testnet and verify full flow
- [ ] Update documentation and README for hackathon judges

## Surprises & Discoveries

(To be populated during implementation)

## Decision Log

(To be populated as decisions are made)

## Outcomes & Retrospective

(To be completed after major milestones or final delivery)

## Context and Orientation

The project lives at `/Users/viniciusassis/Developer/ethglobal/` and consists of three main modules:

**Contracts (`contracts/`)**: Foundry-based Solidity smart contracts deployed on Chiliz (chain ID 88888 mainnet, 88882 testnet). The core contracts are `PredictionHub.sol` (factory for creator registration and market creation), `Market.sol` (individual prediction market with three-outcome staking), and `NetworkConfig.sol` (multi-chain configuration). Users stake CHZ (Chiliz native token) on outcomes A, B, or Draw. After the staking deadline, the creator calls `triggerExecution(outcome)` to lock in the community's chosen outcome. The contracts currently mock the Polymarket return via `mockPolymarketReturn`.

**Frontend (`frontend/`)**: Next.js 15 + TypeScript application built with Lovable (a no-code platform for rapid prototyping). The UI is functional but basic. It includes routes for community management, market browsing, and staking. The frontend uses wagmi for wallet connection and contract interaction. Supabase stores comments on events.

**CRE Workflow (`cre/lock-market/`)**: A Chainlink CRE (Chainlink Request Execution) workflow designed to automate the lock-market process. The workflow runs on a cron schedule and calls a Next.js API endpoint `/api/market/lock` to trigger execution on a market contract. The workflow uses cache settings to ensure only one node in the DON (Decentralized Oracle Network) makes the HTTP call, preventing duplicate executions. According to user feedback, this integration is currently broken.

The project was initially named "Predít" but requires renaming for branding and clarity. The immediate scope includes fixing the CRE workflow, implementing real Polymarket execution, redesigning the UI for better UX, and resolving the CHZ handling strategy (whether to keep stakes in native CHZ or convert to a stablecoin immediately upon staking).

## Plan of Work

**Phase 1: Naming and Strategy Decisions**

Begin by brainstorming and selecting a new project name. The name should evoke community, prediction, sports, or collective intelligence. Check domain availability for `.com` and `.xyz`. Propose 3-5 options to the user for final selection. Once chosen, update all references in code, documentation, and configuration files.

Next, resolve the CHZ handling strategy. The choice is between:
- **Option A (Simple)**: Accept CHZ stakes and hold them in the native token until the creator triggers execution. Show the total pool value in USD equivalent at trigger time. This approach introduces price volatility risk between staking and execution but avoids gas costs and slippage on every deposit.
- **Option B (Complex)**: Convert CHZ to USDC (or another stablecoin) on each stake. This eliminates volatility risk but adds gas cost and DEX slippage to every user deposit, increasing friction.

For a hackathon MVP, **Option A is recommended** because it simplifies the implementation, reduces gas costs, and keeps the user experience clean. The volatility risk can be mitigated by setting short staking deadlines (e.g., 24-48 hours). Document this decision in the `Decision Log`.

**Phase 2: UI Redesign with v0**

The current UI is functional but basic. A professional, sports-focused redesign will significantly improve the hackathon presentation and user experience. Use v0.dev (Vercel's AI UI generator) to rapidly generate high-quality React components.

**Step 1: Tailwind Config Update**

Before generating components, update the Tailwind configuration to support the new white/orange color system. Edit `frontend/tailwind.config.ts`:

- Add custom colors: `primary` (orange shades), `success` (green), `danger` (red), `warning` (amber)
- Define orange gradients: `gradient-primary` from `#FF6B35` to `#E55A2B`
- Add custom shadows: `shadow-glow` for orange glowing effect on hover
- Include display font (Bebas Neue) for hero text alongside Inter

Use the design system prompt from `V0_PROMPTS.md` section 1 to generate the complete config. After updating, run `npm run dev` in the frontend to verify Tailwind processes the new config without errors.

**Step 2: Generate Components in v0.dev**

Visit https://v0.dev and paste each prompt from `V0_PROMPTS.md` one at a time:

1. **Landing Hero** (Prompt #2): Generate a hero section component. Copy the output as `frontend/src/components/LandingHero.tsx`. Review for responsive breakpoints and adjust spacing if needed.

2. **Market Detail Card** (Prompt #3): Generate the market detail page layout. This is the most complex component—includes betting interface, countdown timers, stats display. Copy output to `frontend/src/components/MarketDetailCard.tsx` and `frontend/src/components/StakingModal.tsx` (if generated separately).

3. **Creator Dashboard** (Prompt #4): Generate dashboard with stats grid and market table. Copy to `frontend/src/components/CreatorDashboard.tsx`.

4. **Community Feed** (Prompt #5): Generate community page with market grid. Copy to `frontend/src/components/CommunityFeed.tsx` and `frontend/src/components/MarketCard.tsx`.

5. **Header Navigation** (Prompt #7): Generate responsive header with wallet connection. Copy to `frontend/src/components/layout/Header.tsx` (replace existing).

6. **Staking Modal** (Prompt #6): Generate modal/drawer for placing bets. Copy to `frontend/src/components/StakingModal.tsx`.

After generating each component:
- Review the code for TypeScript errors
- Ensure shadcn-ui components are used (Button, Card, Badge, etc.)
- Verify responsive classes (sm:, md:, lg: breakpoints)
- Check for accessibility attributes (aria-labels, roles)

**Step 3: Integrate Components into Pages**

Replace the existing page files with the new components, preserving contract interaction logic:

**Landing Page** (`frontend/app/page.tsx`):
- Import `LandingHero` component
- Keep existing mock data for featured communities
- Replace the old hero section with `<LandingHero />`
- Update `CommunityCard` component to use new styling (white background, orange accents)

**Market Detail Page** (`frontend/app/events/[id]/page.tsx`):
- Import `MarketDetailCard` and `StakingModal`
- Keep all existing contract read/write hooks (useContractRead, useContractWrite, etc.)
- Replace the betting interface section with `<MarketDetailCard />`, passing contract data as props
- When user clicks stake button, open `<StakingModal />` with selected side (yes/no)
- Preserve the claim rewards logic and user stake display

**Creator Dashboard** (`frontend/app/dashboard/page.tsx`):
- Import `CreatorDashboard` component
- Replace stats grid and active bets list with new component
- Pass contract data (totalBets, totalVolume, winRate, activeBets) as props
- Keep navigation to market detail pages intact

**Community Page** (`frontend/app/communities/[id]/page.tsx`):
- Import `CommunityFeed` component
- Fetch community data from contract (name, description, member count)
- Pass list of markets to `CommunityFeed` as props
- Replace old market list with new grid layout

**Step 4: Update Shared Components**

Update existing shared components to match the new design:

- **SafeConnectButton** (`frontend/src/components/SafeConnectButton.tsx`): Update styling to orange gradient when not connected, orange border pill when connected
- **BetCard** (`frontend/src/components/BetCard.tsx`): Simplify to match new `MarketCard` design
- **CountdownTimer** (`frontend/src/components/CountdownTimer.tsx`): Update to use orange text for urgency (< 24 hours)

**Step 5: Test and Refine**

Start the development server and test each page:

    cd frontend
    npm run dev
    # Open http://localhost:3000

**Test checklist:**
- Landing page hero renders correctly, CTAs work
- Market detail page loads contract data, betting interface opens modal
- Staking modal validates input, shows errors, connects to wallet
- Creator dashboard displays stats, market table is sortable
- Community feed shows market grid, filters work
- Header navigation is sticky, wallet connection dropdown works
- Responsive design: test on mobile (375px), tablet (768px), desktop (1280px)
- Dark mode compatibility (if applicable)

Fix any TypeScript errors, layout issues, or missing props. Adjust spacing, colors, and shadows to match the design system.

**Step 6: Polish and Animations**

Add final polish touches:
- Fade-in animations on page load (use Framer Motion or CSS transitions)
- Skeleton loaders for contract data fetching
- Toast notifications on successful stake/claim (use sonner library)
- Confetti animation on claim success (use react-confetti or similar)
- Hover effects on cards (lift shadow, scale slightly)
- Loading spinners for wallet transactions

**Phase 3: CRE Workflow Diagnosis and Fix**

Investigate the broken CRE integration by running the simulation command from the project root:

    cre workflow simulate ./cre/lock-market --target=staging-settings

Capture the error output. Common failure modes include:
- Missing or invalid environment variables in `.env` or `secrets.yaml`
- Incorrect API URL in `config.staging.json`
- Network connectivity issues or CORS errors from the Next.js API endpoint
- Invalid contract address or ABI mismatch
- Authentication failures in the workflow's HTTP request

Once the root cause is identified, fix it by updating the appropriate configuration file or code. If the workflow requires a private key for chain writes, ensure `CRE_ETH_PRIVATE_KEY` in `.env` is valid and funded on the target network. If the API endpoint is missing or broken, create or fix the `/api/market/lock` route in `frontend/app/api/market/lock/route.ts`.

After fixing, re-run the simulation and verify that the workflow successfully calls the API and logs a transaction hash. Capture the successful output in `Artifacts and Notes`.

**Phase 3: Polymarket Execution Layer**

The current contracts mock Polymarket interaction via `mockPolymarketReturn`. For hackathon delivery, implement a minimal relay service or API integration that demonstrates the concept without requiring full CLOB (Central Limit Order Book) access.

Create a new API route `frontend/app/api/polymarket/execute/route.ts` that:
1. Accepts a POST request with `{ marketAddress, outcome, amountCHZ }`
2. Converts CHZ amount to USD equivalent using a price oracle or static rate
3. Calls a Polymarket API endpoint (or mock endpoint for demo) to place the bet
4. Returns a response with `{ success, txHash, polymarketOrderId }`

If real Polymarket API access is not available, implement a mock service that simulates the response and logs the action. Document this as a "demo mode" feature that will be replaced with real CLOB integration post-hackathon.

Update the `Market.sol` contract to emit an event `ExecutionTriggered(outcome, amountCHZ, polymarketOrderId)` when execution is called. The frontend can listen to this event to update the UI.

**Phase 4: UI Redesign**

Design and implement a clean, sports-focused UI that emphasizes the community prediction narrative. The redesign should include:

**Creator Dashboard**: A view where creators can register, import Polymarket markets (via market ID or URL), set staking deadlines, and trigger execution. Show stats like total communities, total markets created, and total CHZ staked across all markets.

**Community View**: A feed of active markets within a community. Each market card shows the Polymarket question, staking deadline, current pool distribution (% on A, B, Draw), and total CHZ staked. Users can click a market to view details.

**Market Detail Page**: The core interaction page. At the top, display the Polymarket question, deadline, and resolution date. Below, show three large buttons for staking on A, B, or Draw, with real-time pool sizes and percentages. Include a comment section (Supabase-backed) for community discussion. After the deadline, show the creator's chosen outcome and execution status. After resolution, show the winning outcome and allow winners to claim rewards.

**Staking Interface**: When a user clicks a stake button, open a modal with an input for CHZ amount, a wallet balance display, and a "Stake" CTA. After confirming the transaction, show a success toast with a link to the transaction on the block explorer.

**Visual Style**: Use Chiliz brand colors (red and black), sports imagery (stadium backgrounds, fan crowds), and bold typography. Emphasize real-time updates (use wagmi's `useContractRead` with polling or event listeners).

Implement the redesign by editing files in `frontend/app/` and `frontend/src/components/`. Use shadcn-ui components for consistency. Test the UI locally with `npm run dev` and verify all flows.

**Phase 5: Testing and Validation**

Write an end-to-end test script that:
1. Deploys contracts to Chiliz testnet (Spicy)
2. Registers a creator
3. Creates a market with a short staking deadline (e.g., 5 minutes)
4. Simulates multiple users staking on different outcomes
5. Waits for the deadline to pass
6. Creator triggers execution via the CRE workflow
7. Simulates Polymarket return with a winning outcome
8. Winners claim rewards
9. Verifies final balances and emitted events

Run this test on testnet and capture the transaction hashes, contract addresses, and UI screenshots. These artifacts will be included in the hackathon submission.

**Phase 6: Documentation Update**

Update `README.md` to reflect the new name, architecture, and hackathon narrative. Include:
- Project overview and value proposition
- Architecture diagram (contracts + frontend + CRE + Polymarket relay)
- Quick start guide for judges (how to run locally, how to test on testnet)
- Links to deployed contracts and live demo
- Roadmap section highlighting what's implemented vs. what's next (e.g., real CLOB integration, governance features)

Update `contracts/README.md` and `frontend/README.md` with module-specific details. Add a `HACKATHON.md` file summarizing the submission for judges.

## Concrete Steps

**Step 1: Name Selection**

From the workspace directory, brainstorm names and check domain availability:

    cd /Users/viniciusassis/Developer/ethglobal
    # Brainstorm: StakeVerse, FanBet Collective, PredictClub, BetTogether, CrowdCall
    # Check domains manually or use a whois tool

**Step 2: CHZ Strategy Decision**

Document the chosen strategy (Option A recommended) in the `Decision Log` and update this plan accordingly.

**Step 3: Update Tailwind Config**

Edit the Tailwind configuration file to add the white/orange color system:

    cd /Users/viniciusassis/Developer/ethglobal/frontend
    # Edit tailwind.config.ts with new color definitions
    npm run dev
    # Verify no build errors

Expected: Tailwind compiles successfully, new color classes are available (e.g., `bg-primary`, `text-primary`, `gradient-primary`).

**Step 4: Generate Components in v0**

Visit https://v0.dev and generate each component:

    # Paste each prompt from V0_PROMPTS.md into v0.dev
    # For each generated component:
    # 1. Review the code
    # 2. Copy to frontend/src/components/<ComponentName>.tsx
    # 3. Fix any import paths or TypeScript errors
    # 4. Commit the new component

Expected output: Six new component files in `frontend/src/components/`:
- `LandingHero.tsx`
- `MarketDetailCard.tsx`
- `StakingModal.tsx`
- `CreatorDashboard.tsx`
- `CommunityFeed.tsx`
- `MarketCard.tsx`

**Step 5: Integrate Components into Pages**

Update the page files to use the new components:

    cd /Users/viniciusassis/Developer/ethglobal/frontend
    # Edit app/page.tsx - replace hero section
    # Edit app/events/[id]/page.tsx - integrate MarketDetailCard
    # Edit app/dashboard/page.tsx - integrate CreatorDashboard
    # Edit app/communities/[id]/page.tsx - integrate CommunityFeed
    npm run dev
    # Open http://localhost:3000 and test each page

Expected: Each page renders with the new design, no console errors, contract data displays correctly.

**Step 6: Test Responsive Design**

Test the UI across different screen sizes:

    # In browser dev tools, test responsive views:
    # - Mobile: 375px width (iPhone SE)
    # - Tablet: 768px width (iPad)
    # - Desktop: 1280px width (standard laptop)

Expected: Layout adapts gracefully, no horizontal scroll, stacked elements on mobile, grid layouts on desktop.

**Step 7: Diagnose CRE**

Run the CRE simulation from the project root:

    cd /Users/viniciusassis/Developer/ethglobal
    cre workflow simulate ./cre/lock-market --target=staging-settings

Capture the output. If it fails, inspect `cre/lock-market/config.staging.json` and `cre/lock-market/.env`. Fix any missing or incorrect values.

**Step 8: Fix CRE and Test**

After fixing, re-run the simulation and verify success:

    cre workflow simulate ./cre/lock-market --target=staging-settings
    # Expected output: HTTP call to /api/market/lock, response with txHash, workflow completes

**Step 9: Implement Polymarket Relay**

Create the API route:

    cd frontend
    # Create app/api/polymarket/execute/route.ts
    # Implement POST handler with mock or real Polymarket API call

Test the endpoint locally:

    curl -X POST http://localhost:3000/api/polymarket/execute \
      -H "Content-Type: application/json" \
      -d '{"marketAddress":"0x...","outcome":0,"amountCHZ":"1000000000000000000"}'

Expected response:

    {"success":true,"txHash":"0x...","polymarketOrderId":"mock-order-123"}

**Step 10: End-to-End Test**

Deploy to Chiliz Spicy testnet:

    cd contracts
    export PRIVATE_KEY=<testnet-private-key>
    forge script script/Deploy.s.sol --rpc-url https://spicy-rpc.chiliz.com --broadcast

Capture the deployed PredictionHub address. Update the frontend's contract address in `src/lib/contracts.ts`. Run the manual test flow in the browser and document each step with screenshots.

**Step 11: Documentation**

Update README files:

    cd /Users/viniciusassis/Developer/ethglobal
    # Edit README.md, contracts/README.md, frontend/README.md
    # Create HACKATHON.md with submission narrative

## Validation and Acceptance

After completing all phases, the following behaviors must be observable:

1. **Name Change Visible**: Opening the frontend at `http://localhost:3000` shows the new project name in the header, page title, and metadata.

2. **CRE Workflow Functional**: Running `cre workflow simulate ./cre/lock-market --target=staging-settings` from the project root completes without errors and logs a successful API call with a transaction hash.

3. **Polymarket Relay Works**: Sending a POST request to `/api/polymarket/execute` returns a JSON response with `success: true` and a mock or real order ID.

4. **UI Redesigned**: The frontend displays the creator dashboard, community view, and market detail pages with the new design. Staking on an outcome triggers a wallet transaction and updates the pool sizes in real-time.

5. **End-to-End Flow**: A user can register as a creator, create a market, stake CHZ, wait for the deadline, trigger execution via CRE, observe the Polymarket relay call, simulate resolution, and claim rewards. All steps are verifiable on the Chiliz Spicy testnet block explorer.

6. **Documentation Current**: The README and HACKATHON.md files accurately describe the project, include live demo links, and explain the architecture.

Run `npm run lint` in the frontend and `forge test` in the contracts to ensure code quality and test coverage remain high.

## Idempotence and Recovery

All steps can be run multiple times safely. If a contract deployment fails, re-run the deploy script (it will deploy a new instance). If the CRE simulation fails, fix the configuration and re-run without side effects. If the frontend build fails, fix syntax errors and restart the dev server. If a testnet transaction fails, check the error message on the block explorer and retry with adjusted gas or parameters.

To reset the local development environment:

    cd /Users/viniciusassis/Developer/ethglobal
    cd contracts && forge clean && forge build
    cd ../frontend && rm -rf .next && npm run dev

## Artifacts and Notes

(To be populated with command outputs, screenshots, and transaction hashes during implementation)

## Interfaces and Dependencies

**Smart Contracts (Solidity)**

In `contracts/src/Market.sol`, ensure the following interface exists:

    event ExecutionTriggered(Outcome outcome, uint256 amountCHZ, string polymarketOrderId);
    
    function triggerExecution(Outcome outcome) external onlyCreator {
        // existing logic
        emit ExecutionTriggered(outcome, address(this).balance, "pending");
        // call Polymarket relay via CRE or API
    }

**Frontend API Route (TypeScript)**

In `frontend/app/api/polymarket/execute/route.ts`, define:

    export async function POST(req: Request) {
      const { marketAddress, outcome, amountCHZ } = await req.json();
      // Call Polymarket API or mock service
      return Response.json({ success: true, txHash: "0x...", polymarketOrderId: "..." });
    }

**CRE Workflow (TypeScript)**

In `cre/lock-market/main.ts`, ensure the workflow calls the correct API endpoint and parses the response. The workflow should use `cacheSettings` to prevent duplicate executions.

**Frontend Contract Client (TypeScript)**

In `frontend/src/lib/contracts.ts`, export contract addresses and ABIs:

    export const PREDICTION_HUB_ADDRESS = "0x..." as const;
    export const PREDICTION_HUB_ABI = [...] as const;

Use wagmi's `useContractWrite` and `useContractRead` hooks throughout the UI for wallet integration.

---

**Revision Log**

- 2026-02-23: Initial plan created. Defined scope: rename, UI redesign, CRE fix, Polymarket execution, CHZ strategy. Structured as ExecPlan per PLANS.md.
