# Study Kit

Organize courses, sections, and study notes. Notes are written and stored as
markdown in Cloudflare R2. Upload a PDF and it gets converted to markdown via
Mistral OCR; ask questions about a note via OpenRouter.

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- Better Auth (Google OAuth) with MongoDB adapter
- Cloudflare R2 for markdown storage (via `@aws-sdk/client-s3`)
- Mistral OCR for PDF → markdown
- OpenRouter for ask-a-question
- Vitest for tests
- PWA (manifest + service worker)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm test` — run tests once
- `npm run test:watch` — watch mode

## Environment variables

Required:

- `DB_CONNECTION_STRING` — MongoDB connection string (auth storage)
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `GOOGLE_AUTH_CLIENT_ID`, `GOOGLE_AUTH_CLIENT_SECRET`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
- `MISTRAL_API_KEY` — for PDF → markdown
- `OPENROUTER_API_KEY` — for ask-a-question

Optional:

- `R2_ENDPOINT` — override the default R2 endpoint
- `AUTH_DISABLED=true` — bypass auth locally

## Project layout

- `app/` — routes, server actions, PWA registration, service worker
- `app/courses/[year]/[courseId]/[sectionId]/[filename]/` — note view/edit
- `lib/courses/` — course metadata repository (backed by `data/courses.json`)
- `lib/content/` — R2 client, content repository, Mistral OCR
- `lib/auth.ts` — Better Auth setup
- `proxy.ts` — auth redirect for non-public paths
- `data/courses.json` — course/section definitions
