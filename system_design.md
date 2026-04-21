# BattleZone Pro — System Design

## Overview

BattleZone Pro is a mobile-first Esports tournament platform built with **Next.js 15 (App Router)**, **TypeScript**, **Firebase (Firestore + Auth)**, **Tailwind CSS 4**, and **Razorpay** for payments.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Database | Firebase Firestore (via Admin SDK on server, Client SDK on client) |
| Auth | Firebase Auth (client-side login) + HTTP-only session cookies |
| Payments | Razorpay |
| AI | Google Gemini (`@google/genai`) |
| Animations | Motion (Framer Motion v12) |
| Mobile | Capacitor (Push Notifications) |

---

## Final File Structure

```
/
├── app/
│   ├── layout.tsx                  # Root layout (Inter font, AppStatusListener)
│   ├── page.tsx                    # Root redirect → /home or /login
│   ├── globals.css                 # Tailwind imports + design tokens + utility classes
│   │
│   ├── (auth)/                     # Auth group — no session required
│   │   ├── login/page.tsx          # Firebase email/password login → createSession
│   │   └── register/page.tsx       # New user registration
│   │
│   ├── (user)/                     # Player app group
│   │   ├── layout.tsx              # Reads session cookie → Sidebar + TopNavbar + BottomNav
│   │   ├── home/
│   │   │   ├── page.tsx            # Server Component: fetches banners, matches, games from Firestore
│   │   │   ├── HomeBanners.tsx     # Client Component: 16:9 auto-sliding banner carousel
│   │   │   ├── HomeMatchTabs.tsx   # Client Component: tabbed "My Matches" view
│   │   │   └── HomeWalletCard.tsx  # Client Component: Razorpay top-up button
│   │   ├── matches/
│   │   │   ├── page.tsx            # Server: all tournaments, horizontally-scrollable tab filters
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Server: single match detail with room credentials
│   │   │       └── JoinMatchSection.tsx  # Client: slot picker + join action
│   │   ├── wallet/
│   │   │   ├── page.tsx            # Server: wallet balances + transaction history
│   │   │   └── WalletClient.tsx    # Client: deposit / withdraw UI
│   │   ├── profile/page.tsx        # Server: user stats, wallet breakdown, recent txns
│   │   ├── rank/page.tsx           # Server: leaderboard sorted by currentMonthWinnings
│   │   ├── support/
│   │   │   ├── page.tsx            # Server wrapper
│   │   │   └── SupportClient.tsx   # Client: submit/view support tickets
│   │   ├── chat/
│   │   │   ├── page.tsx            # Server: passes uid + ffName
│   │   │   └── UserChatClient.tsx  # Client: real-time Firestore global_chat listener
│   │   └── vip/page.tsx            # Redirects → /home (VIP system removed)
│   │
│   ├── admin/                      # Super-admin panel (role="admin" cookie required)
│   │   ├── login/page.tsx
│   │   └── (panel)/
│   │       ├── layout.tsx          # Client: sidebar nav + destroySession
│   │       ├── dashboard/page.tsx  # KPI stats: totalPlayers, liveMatches, pendingWithdrawals
│   │       ├── tournaments/        # CRUD tournaments
│   │       ├── prize-dist/         # Credit match winnings to players
│   │       ├── withdrawals/        # Approve / reject withdrawal requests
│   │       ├── users/              # Block/unblock, add bonus, grant VIP
│   │       ├── banners/            # Manage home page hero banners
│   │       ├── categories/         # Manage game categories
│   │       ├── notifications/      # Push notification sender
│   │       ├── transactions/       # View/search all transactions
│   │       ├── leaderboard/        # Monthly leaderboard view
│   │       ├── staff/              # Create/edit/delete staff accounts
│   │       ├── support/            # View and reply to support tickets
│   │       └── settings/           # General settings, pricing, withdraw limits
│   │
│   └── staff/                      # Staff panel (role="staff" cookie required)
│       ├── login/page.tsx
│       └── (panel)/
│           ├── layout.tsx          # Client: sidebar + destroyStaffSession
│           ├── dashboard/page.tsx
│           ├── matches/            # Match management (post room credentials)
│           ├── prize-dist/         # Distribute prizes for ongoing matches
│           ├── users/              # Manage players
│           ├── global-chat/        # Moderate global chat (GlobalChatClient)
│           ├── vip-chat/           # DM VIP players (VipChatClient)
│           ├── notifications/      # Send push notifications
│           ├── transactions/       # View transaction log
│           ├── leaderboard/        # Leaderboard view
│           └── banners/            # Banner management
│
├── actions/                        # Next.js Server Actions ("use server")
│   ├── session.ts                  # createSession, destroySession (Firebase token verify → cookie)
│   ├── staff-session.ts            # createStaffSession, destroyStaffSession, verifyStaffCredentials
│   ├── auth.ts                     # registerUser
│   ├── wallet.ts                   # createOrder (Razorpay), verifyPayment
│   ├── wallet-server.ts            # withdrawRequest, getUserWallet
│   ├── match.ts                    # joinMatch, leaveMatch
│   ├── admin.ts                    # getAdminStats, getAllTournaments, createTournament, etc.
│   ├── notifications.ts            # sendPushNotification helpers
│   ├── redeem.ts                   # redeemCode
│   └── support.ts                  # createTicket, getTickets
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx              # Base button with variants
│   │   ├── Skeleton.tsx            # Loading skeleton shimmer
│   │   └── Card.tsx                # Card wrapper
│   └── user/
│       ├── Navigation.tsx          # BottomNav (mobile 5-tab) + Sidebar (desktop)
│       ├── TopNavbar.tsx           # Mobile-only sticky top bar (branding + wallet + bell)
│       ├── NotificationBell.tsx    # Real-time unread notification badge
│       ├── NotificationsProvider.tsx  # Firestore listener → marks notifications read
│       └── AppStatusListener.tsx   # Listens to Firestore "settings/appStatus" → maintenance page
│
├── lib/
│   ├── firebase-client.ts          # Client-side Firebase app + db + auth + getFirebaseClient()
│   ├── firebase-admin.ts           # Server-side Admin SDK: getAdminApp, getAdminDb, getAdminAuth
│   ├── fcm-server.ts               # sendTargetedPushNotification via FCM HTTP v1
│   └── utils.ts                    # cn(), formatCurrency()
│
├── hooks/
│   └── usePushNotifications.ts     # Capacitor PushNotifications hook (mobile app)
│
├── next.config.ts                  # serverExternalPackages: ["firebase-admin"]
├── postcss.config.mjs              # @tailwindcss/postcss
└── system_design.md                # This file
```

---

## Data Flow

### 1. Authentication
```
User enters credentials (client)
  → Firebase Auth SDK (signInWithEmailAndPassword)
  → Get ID Token
  → createSession() Server Action
      → firebase-admin verifyIdToken()
      → Firestore: read users/{uid}.role
      → Set HTTP-only cookies: "session" (uid), "role"
  → Client redirects to /home
```

### 2. Home Page Data
```
app/(user)/home/page.tsx  [Server Component]
  → reads "session" cookie (uid)
  → Firestore (Admin SDK):
      - users/{uid}            → user profile
      - tournaments (latest 100) → match list
      - admin_banners           → hero banners
      - admin_games             → game categories
  → JSON.parse(JSON.stringify(data))   ← strips Firestore Timestamps
  → passes plain objects to Client Components:
      HomeBanners    ← banners[]
      HomeMatchTabs  ← matches[] filtered by uid
```

### 3. Real-time Chat
```
UserChatClient  [Client Component, "use client"]
  → getFirebaseClient()  → { db }  (singleton Client SDK)
  → Firestore onSnapshot("global_chat")
  → Real-time message updates via WebSocket
  → addDoc() to post new messages
```

### 4. Payments (Razorpay)
```
WalletClient clicks "Add Money"
  → createOrder() Server Action
      → Razorpay API: orders.create()
      → returns { orderId, keyId }
  → Load Razorpay checkout script (client-side)
  → User pays via Razorpay modal
  → verifyPayment() Server Action
      → Validate HMAC signature
      → Firestore: update wallets.deposit + log transaction
```

### 5. Match Joining
```
JoinMatchSection  [Client Component]
  → User picks a slot
  → joinMatch() Server Action
      → Firestore transaction:
          - Check slot availability
          - Deduct entry fee from wallet (priority: deposit > bonus)
          - Add user to tournament.joinedUsers[]
          - Log transaction
      → revalidatePath("/matches")
```

---

## Key Architectural Decisions

### Server vs Client Components
- **Server Components** (default): All `page.tsx` and `layout.tsx` files that only fetch data. They can use `cookies()`, `firebase-admin`, and Server Actions directly.
- **Client Components** (`"use client"`): Any file using React hooks (`useState`, `useEffect`, `usePathname`) or browser APIs. These import from `lib/firebase-client.ts` for real-time Firestore.

### Firebase Timestamp Serialisation
Firestore `Timestamp` objects cannot cross the Server→Client boundary in Next.js. All data fetched on the server and passed as props to Client Components is sanitised with:
```ts
JSON.parse(JSON.stringify(data))
```
This converts `Timestamp` to its ISO-8601 string representation safely.

### Session Security
- Sessions are stored in **HTTP-only cookies** (not localStorage) — immune to XSS.
- The `session` cookie stores the Firebase UID.
- The `role` cookie stores the user role (`user`, `staff`, `admin`).
- All protected routes check the cookie in the Server Component before rendering.

### Navigation Architecture (Mobile)
```
┌─────────────────────────────────────┐
│  TopNavbar (sticky, mobile only)    │  ← Logo + Wallet + Notification Bell
├─────────────────────────────────────┤
│  Page Content                       │
│  (scrollable)                       │
├─────────────────────────────────────┤
│  BottomNav (fixed, mobile only)     │  ← Home · Matches · Rank · Wallet · Profile
└─────────────────────────────────────┘

Desktop: Left Sidebar replaces both TopNavbar and BottomNav
```

---

## Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | Player profiles, wallet balances, role, referral code |
| `tournaments` | Match data: name, fee, prize pool, joinedUsers[], status |
| `transactions` | Wallet transaction log (deposit, withdrawal, match fee, prize) |
| `withdrawals` | Pending/approved withdrawal requests |
| `global_chat` | Real-time global chat messages |
| `direct_messages` | Staff ↔ player DMs (uid-scoped) |
| `notifications` | In-app push notifications per user |
| `admin_banners` | Home page hero banner images + links |
| `admin_games` | Game category icons + names |
| `staff_users` | Staff account credentials |
| `redeem_codes` | Redeemable bonus codes |
| `support_tickets` | Player support requests |
| `settings` | `general`, `socials`, `pricing`, `withdrawLimits`, `referral`, `appStatus` |
