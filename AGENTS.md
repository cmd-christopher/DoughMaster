# AGENTS.md

This document guides human contributors and AI agents working in this repository. It defines how to run, preview, build, and safely modify the project, along with coding policies and tooling conventions.

## Overview

- Name: DoughMaster
- Type: Next.js 15 + React 18 + TypeScript web app
- Purpose: Interactive dough/recipe calculator UI (`src/components/doughmaster-app.tsx`).
- Status: Local preview requires no secrets. Optional AI/Firebase utilities exist but are not required for preview.

## Tech Stack

- Framework: Next.js 15 (`app/` router), React 18, TypeScript
- Styling: Tailwind CSS, shadcn/ui, Radix UI, lucide-react
- Data: Local state + browser storage; TanStack Query present; Firebase deps installed but optional
- AI tooling (optional): `genkit`, `@genkit-ai/*` for local dev experiments

## Node and Tooling

- Required Node: 18.17+ (recommend Node 20 LTS)
- Package manager: npm (lockfile present). Use `npm ci` in CI.
- Linting/Typecheck: Next lint + `tsc --noEmit`

## Commands

- Dev (Turbopack on 9002): `npm run dev`
- Build: `npm run build`
- Start (prod, default 3000): `npm run start`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Genkit (optional):
  - Dev: `npm run genkit:dev`
  - Watch: `npm run genkit:watch`

## Runbook

Local preview
1) Install deps: `npm ci` (or `npm install`)
2) Start dev server: `npm run dev`
3) Open: `http://localhost:9002`

Production-like preview
1) Build: `npm run build`
2) Start: `npm run start` → open `http://localhost:3000`
3) Custom port: `npm run start -- -p 9002`

Troubleshooting
- Port busy: Next prompts to switch ports; use the printed URL
- Node version: verify with `node -v`; use 18.17+ (20 recommended)
- Env vars: none required to load the homepage; AI/Firebase features are optional

## Repository Map

- App entry: `src/app/page.tsx`
- App shell: `src/app/layout.tsx`, `src/app/globals.css`
- Main UI: `src/components/doughmaster-app.tsx`
- UI atoms: `src/components/ui/*`
- Hooks: `src/hooks/*`
- Utilities and types: `src/lib/*`
- Config: `package.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`
- Docs: `docs/blueprint.md`

## Coding Guidelines

- Keep changes minimal, focused, and consistent with existing style
- Prefer readability and simple abstractions; avoid over-engineering
- TypeScript: no implicit `any`; keep strictness aligned with repo settings
- Do not add license headers unless requested
- Avoid unrelated refactors in the same commit

## Dependency Policy

- Use semver-compatible updates where safe
- Security: prefer `npm audit` clean state
- Overrides: `package.json` may include `overrides` for transitives (e.g., `form-data`, `@babel/runtime`) — keep or update as needed to maintain zero vulnerabilities

## Testing and Validation

- If tests exist, run them locally before proposing changes
- This repo currently has no dedicated test suite; validate by starting the dev server and exercising core UI flows

## Agent Operating Procedures

- File editing: use atomic patches; don’t introduce unrelated changes
- Search: prefer `rg` for fast code search
- Large files: read in chunks (≤250 lines) when inspecting
- Commits: use Conventional Commits style (e.g., `feat: ...`, `fix: ...`, `chore: ...`)
- Plans: for multi-step work, outline steps and mark progress
- Safety:
  - Don’t remove secrets or rewrite history
  - Don’t push destructive changes without confirmation
  - Call out assumptions and ask for missing context

## CI Suggestions (optional)

- Add workflows to run `npm ci`, `npm run typecheck`, `npm run lint`, and `npm audit --production`

## Known Gaps / Future Work

- No formal tests; consider adding unit tests around core calculation logic
- README is minimal; cross-link this AGENTS.md and add screenshots

## Decision Log (add entries below)

- 2025-09-04: Upgraded `next` to `^15.5.2` and added `overrides` to resolve vulnerabilities; `npm audit` reports 0 vulnerabilities.

