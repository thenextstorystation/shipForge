# Stack & Configuration

_Produced by Axel — the Quartermaster. Validated before any code is built._

## Chosen stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | Postgres (Neon or Supabase) |
| Auth | Clerk |
| Payments | Stripe (only if the product takes payments) |
| Hosting | Vercel (deploy target (Nova)) |

## Key inventory

| Secret | Provider | Status |
| --- | --- | --- |
| DATABASE_URL | postgres | valid |
