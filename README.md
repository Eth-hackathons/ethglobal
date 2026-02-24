# LIVE README - EthGlobal Project

Last updated: 2026-02-24

## Live Document Rule

This is a **LIVE README** and it must be updated after every relevant product/technical discussion.

If we change scope, rules, UX, architecture, or priorities, we update this file in the same session.

## Project Idea

Community-driven prediction markets: people discuss in communities, stake together, and execute one collective position on imported Polymarket events.

Core concept:
- Chat to coordinate conviction
- Bet together as a community
- Use transparent onchain logic for staking and rewards

## Product Decision (Current)

Decision authority and fallback:
- The community owner (creator) has final decision power on which side to execute.
- If no owner decision is made, execution is automatically triggered **10 minutes before** Polymarket market end.
- A cancel action is available for last-minute mistakes.

Required safety constraints for cancel:
- Cancel should be time-limited (example: only before a final cutoff).
- Cancel should be auditable (event log + reason).
- Cancel should be abuse-resistant (example: one cancel per market, or penalty/rate limit).

## Why This Direction

- Fast MVP for hackathon judging.
- Clear accountability model (owner decides).
- Predictable liveness model (automatic fallback at T-10).
- Human-error mitigation with controlled cancel capability.

## Current Stack

- `contracts/`: Foundry Solidity contracts (`PredictionHub`, `Market`, `NetworkConfig`)
- `ui/`: Next.js app (active implementation surface)
- `cre/lock-market/`: Chainlink CRE workflow for scheduled execution

## Current Priorities

1. Finalize execution rules (owner decision, fallback, cancel constraints) in contracts + UI.
2. Ensure CRE flow is working end-to-end with real config values.
3. Harden market settlement/accounting logic before public demo.
4. Execute UI integration plan directly in `ui/` and replace mock data with live integrations.
5. Tighten demo narrative for Chainlink hackathon submission.
6. Keep this README continuously updated.

## Active Execution Plan

- UI integration plan: `MIGRATION_PLAN.md`

## Live Decisions Log

- 2026-02-23: Adopted owner-first decision model with automatic fallback execution at T-10 minutes and cancel option for last-minute mistakes.
- 2026-02-24: New UI iteration was recreated under `ui/` (same folder on this machine as `UI` because filesystem is case-insensitive). Current status: visual UI only with mock data; integrations still pending.
- 2026-02-24: Added initial step-by-step migration plan (`MIGRATION_PLAN.md`).
- 2026-02-24: Updated direction: active work happens in `ui/` only. `MIGRATION_PLAN.md` was rewritten as a pure UI integration plan; legacy app is reference-only for quick integration checks.
- 2026-02-24: Contract readiness review: architecture is good for MVP, but settlement accounting and execution timing need fixes before demo/public usage.
