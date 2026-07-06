# Bringo Direct — Super Admin

Next.js admin dashboard for managing users, merchants (approval + KYC review), shoppers,
store brands/outlets, products, orders, and subscriptions on the Bringo Direct platform.
It is a pure client of the Laravel API in the `bringo-api` repo — all data lives there.

## Requirements

- Node 20+
- The Laravel API running and reachable (see `LARAVEL_API_URL` below), with an `admin`
  Spatie role assigned to at least one user (there is no self-service admin signup —
  create one via `php artisan tinker` on the API: `$user->assignRole('admin');`)

## Getting started

```bash
npm install
cp .env.example .env.local   # set LARAVEL_API_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

## How auth works

The Laravel API uses Sanctum bearer tokens, not cookies. This app never exposes that
token to the browser: `loginAction` (a Server Action) calls the API's `/login` and
`/profile` endpoints server-side, confirms the `admin` role, and stores the token in an
**httpOnly** cookie. Every subsequent page/mutation reads that cookie server-side
(`lib/api.ts`) and attaches it as `Authorization: Bearer <token>` when calling the API —
the browser only ever talks to this Next.js origin. `proxy.ts` (Next.js 16 renamed
`middleware.ts` to `proxy.ts`) gates every route except `/login` on that cookie's
presence.

## Environment variables

| Variable          | Description                                          |
| ------------------ | ----------------------------------------------------- |
| `LARAVEL_API_URL` | Base URL of the Laravel API, e.g. `https://api.bringodirect.com/api/v1` |

## Deploying

Deploy to Vercel and set `LARAVEL_API_URL` to the production API URL in the project's
environment variables. No other configuration is required — the API's CORS is not in
the request path since all API calls happen server-side.
