# BattleZone Pro — Esports Tournament Platform

## Overview
A Next.js 16 esports tournament platform with role-based access (user, staff, admin), Firebase backend, Razorpay payments, push notifications, redeem codes, and support tickets.

## Architecture
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth & DB**: Firebase (Auth + Firestore) — Admin SDK on server, Client SDK in browser
- **Payments**: Razorpay (test keys, client-side checkout with server-side signature verification)
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Styling**: Tailwind CSS v4

## Route Structure
- `/(auth)` — Login, Register (public)
- `/(user)` — Home, Matches, Wallet, Profile, Rank, Support (requires session cookie)
- `/(staff)` — Dashboard, Matches with Room ID management (requires staff or admin role)
- `/(admin)` — Dashboard, Tournaments, Users, Withdrawals, Support, Settings/Redeem Codes (requires admin role)

## Route Protection
Route protection is handled in `proxy.ts` (Next.js 16 proxy). Reads `session` and `role` cookies set on login.

## Key Files
- `proxy.ts` — Route protection
- `lib/firebase-admin.ts` — Server-side Firebase Admin SDK init
- `lib/firebase-client.ts` — Client-side Firebase config (hardcoded public config)
- `lib/fcm-server.ts` — Push notification server helpers
- `actions/auth.ts` — Registration server action
- `actions/match.ts` — Join match, update room details (staff)
- `actions/wallet.ts` — Razorpay createOrder + verifyPayment
- `actions/wallet-server.ts` — Withdrawal requests
- `actions/redeem.ts` — Redeem code generation and application
- `actions/support.ts` — Support ticket submission and management
- `actions/admin.ts` — Admin actions: stats, approvals, tournament CRUD, user management
- `actions/session.ts` — Session cookie management

## Features Implemented
- **Real-time balance** on Home and Wallet pages (from Firebase)
- **Razorpay payment** — full flow: create order → checkout → verify signature → credit wallet
- **Redeem codes** — Admin generates, users apply, bonus credited
- **Support tickets** — Users submit, admin replies and resolves
- **Room ID revealing** — Staff sets Room ID/Pass, push notification sent to all joined players
- **Admin dashboard** — Real Firebase stats (revenue, players, live matches, pending withdrawals)
- **Withdrawal approval/rejection** — Admin approves, winning balance refunded on reject
- **Tournament management** — Admin creates, updates status, deletes tournaments
- **User management** — Admin changes roles, adds bonus balance
- **Push notifications** — FCM targeted to specific users or all admins

## Required Secrets (set in Replit Secrets panel)
- `FIREBASE_SERVICE_ACCOUNT` — Firebase Admin SDK JSON string
- `RAZORPAY_KEY_ID` — Razorpay public key (rzp_test_...)
- `RAZORPAY_KEY_SECRET` — Razorpay secret key

## Running
- Dev: `npm run dev` (port 5000, 0.0.0.0)
- Build: `npm run build`
- Start: `npm run start` (port 5000, 0.0.0.0)

## Firestore Collections
- `users` — user profiles, wallets, fcmToken, role
- `tournaments` — match data, joinedUsers, roomId/roomPass
- `transactions` — all financial transactions
- `withdrawals` — withdrawal requests
- `redeemCodes` — redeem code registry
- `supportTickets` — user support tickets
