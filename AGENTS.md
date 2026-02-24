# Repository Guidelines

## Project Structure & Module Organization
- `contracts/`: Foundry Solidity project.
  - `src/*.sol` core contracts (`PredictionHub`, `Market`, `NetworkConfig`).
  - `test/*.t.sol` contract and integration tests.
  - `script/*.s.sol` deploy/seed scripts.
  - `ABI/` generated artifacts consumed by the frontend.
- `frontend/`: Next.js 15 + TypeScript app.
  - `app/` routes and API handlers.
  - `src/components`, `src/hooks`, `src/lib` for UI, hooks, and shared clients/utilities.
  - `public/` static assets.
- `cre/lock-market/`: Chainlink CRE workflow (`main.ts`, `workflow.yaml`, config JSON).

# ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in .agent/PLANS.md) from design to implementation.

## Build, Test, and Development Commands
Run commands from each module directory unless noted.

- `cd contracts && npm run build`: compile contracts (`forge build`).
- `cd contracts && npm test`: run offline Foundry tests.
- `cd contracts && npm run test:gas`: run tests with gas report.
- `cd contracts && npm run coverage`: generate Solidity coverage.
- `cd contracts && npm run extract-abi`: refresh ABI artifacts.
- `cd frontend && npm run dev`: start local Next.js server.
- `cd frontend && npm run build`: production build.
- `cd frontend && npm run lint`: run ESLint checks.
- `cd cre/lock-market && bun install`: install CRE dependencies.
- From repo root: `cre workflow simulate ./cre/lock-market --target=staging-settings`.

## Coding Style & Naming Conventions
- Solidity: keep explicit revert messages and consistent formatting; run `forge fmt --check` before PRs.
- TypeScript/React: follow `frontend/eslint.config.js`; prefer 2-space indentation as used in `app/` and `src/`.
- Naming: components in `PascalCase.tsx`, hooks as `useX.ts`, utility files in `camelCase.ts`.
- Next.js conventions: keep route files as `page.tsx`, `layout.tsx`, and API handlers as `route.ts`.

## Testing Guidelines
- Contracts use Foundry (`forge-std`); keep tests in `contracts/test/*.t.sol`.
- Name test functions with `test...` and cover happy path, reverts, and access control.
- Frontend currently has no dedicated unit-test suite; at minimum run `npm run lint` and manually verify changed user flows.

## Commit & Pull Request Guidelines
- Recent history mixes plain imperative messages and Conventional prefixes; prefer concise Conventional Commits (`feat:`, `fix:`, `chore:`).
- Keep commits focused by module (`contracts`, `frontend`, `cre`) when possible.
- PRs should include: scope summary, linked issue/task, test evidence (commands run), and screenshots for UI updates.
- For contract or CRE changes, include network/context details (RPC/chain, addresses, tx hashes) in the PR description.
