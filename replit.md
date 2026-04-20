# BattleZone Pro — Esports Tournament Platform

## Overview
A Next.js 16 esports tournament platform with role-based access (user, staff, admin), Firebase backend, Razorpay payments, and push notifications.

## Architecture
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth & DB**: Firebase (Auth + Firestore) — Admin SDK on server, Client SDK in browser
- **Payments**: Razorpay (webhook at `/api/razorpay/webhook`)
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Styling**: Tailwind CSS v4
- **AI**: Google Gemini API

## Route Structure
- `/(auth)` — Login, Register (public)
- `/(user)` — Home, Matches, Wallet, Profile (requires session cookie)
- `/(staff)` — Dashboard, Matches (requires staff or admin role)
- `/(admin)` — Dashboard, Users, Settings (requires admin role)
- `/api/razorpay/webhook` — Payment webhook

## Route Protection
Route protection is handled in `proxy.ts` (Next.js 16 proxy — replaces middleware). Reads `session` and `role` cookies set on login.

## Key Files
- `proxy.ts` — Route protection (was middleware.ts in Next.js <16)
- `lib/firebase-admin.ts` — Server-side Firebase Admin SDK init
- `lib/firebase-client.ts` — Client-side Firebase config (hardcoded public config)
- `lib/fcm-server.ts` — Push notification server helpers
- `actions/` — Next.js Server Actions (auth, match, wallet)

## Required Environment Variables (Secrets)
Set these in Replit Secrets panel:
- `FIREBASE_SERVICE_ACCOUNT` — Firebase Admin SDK JSON string
- `RAZORPAY_KEY_ID` — Razorpay public key
- `RAZORPAY_KEY_SECRET` — Razorpay secret key
- `RAZORPAY_WEBHOOK_SECRET` — Razorpay webhook secret
- `GEMINI_API_KEY` — Google Gemini API key (optional, for AI features)

## Running
- Dev: `npm run dev` (port 5000, 0.0.0.0)
- Build: `npm run build`
- Start: `npm run start` (port 5000, 0.0.0.0)

## Replit Migration Notes
- Migrated from Vercel to Replit (April 2026)
- `dev-proxy.ts` replaced by native `next dev -p 5000 -H 0.0.0.0`
- `middleware.ts` renamed to `proxy.ts` with `proxy` export (Next.js 16 convention)
- `tsconfig.json` updated for Next.js compatibility
- `next.config.ts` added with `serverExternalPackages: ["firebase-admin"]`
