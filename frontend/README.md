# Take‑home Starter

This is a clean Next.js (App Router) + TypeScript + Tailwind CSS starter with shadcn/ui primitives. It contains no proprietary code or secrets and is safe to zip and share.

The task brief and acceptance criteria will be provided separately.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- shadcn/ui primitives preinstalled: button, card, input, label, textarea, select, badge, table, dialog, dropdown-menu, tabs, sonner
- ESLint (Next.js config) + Prettier

## Prerequisites

- Node.js >= 20
- npm

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Formatting & Linting

- Lint: `npm run lint` | Fix: `npm run lint:fix`
- Format: `npm run format` | Check: `npm run format:check`

## Environment

Copy `.env.example` to `.env` if needed. Do not commit `.env`.

## Candidates – Start Here

- Quick links to important files and examples:
- Task brief and acceptance criteria: `docs/BRIEF.md`
- Environment template: `.env.example`
- Database schema example (source of truth): `supabase/schema.sql`

## Notes for candidates (will be reiterated in the brief)

- Keep user-facing text in code minimal; if needed, centralise strings in a simple constants file.
- You may use the provided shadcn/ui primitives. Avoid adding large UI libraries unless explicitly allowed in the brief.
- Do not add secrets to the repository.
