# BattleZone Pro — CURRENT STATE DOCUMENTATION
**Generated:** April 20, 2026 | **Framework:** Next.js 16 (App Router, Turbopack)

---

## 1. PROJECT OVERVIEW & ARCHITECTURE

### Kya hai ye project?
BattleZone Pro ek **Premium Esports Tournament Platform** hai jahan users (players) tournaments join karte hain, wallet se entry fee dete hain, aur prizes jeette hain. Ek **Staff** panel bhi hai jo room IDs manage karta hai, aur ek **Super Admin** panel hai jo poora system control karta hai.

### Architecture — Next.js 16 Monolith
```
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS 16 MONOLITH                    │
│                                                         │
│  Frontend (React) + Backend (Server Actions + API Routes)│
│                                                         │
│  /(auth)     → Public login/register pages              │
│  /(user)     → Player app (protected by session cookie) │
│  /(admin)    → Super Admin panel (role: "admin")        │
│  /api/       → Webhook endpoints (Razorpay)             │
│                                                         │
│  Firebase Firestore ── Admin SDK (server-only)          │
│  Firebase Auth     ── Client SDK (browser)              │
│  Firebase FCM      ── Push Notifications                │
│  Razorpay          ── Payments (INR)                    │
└─────────────────────────────────────────────────────────┘
```

### Route Protection Flow
```
Request aai
    ↓
proxy.ts (Next.js 16 middleware replacement)
    ↓
cookies mein "session" aur "role" check karo
    ↓
/admin/* → role === "admin" chahiye
/staff/* → role === "staff" or "admin" chahiye
/home, /matches, /wallet, /profile → session chahiye
/login, /register → agar logged in hain to redirect
```

---

## 2. IMPLEMENTED FILES — COMPLETE TREE

```
battlezone-pro/
│
├── app/                              ← Next.js App Router root
│   ├── layout.tsx                    ← Root layout (Inter font, AppStatusListener)
│   ├── page.tsx                      ← "/" → redirects to /home
│   ├── globals.css                   ← Tailwind v4 imports + custom classes
│   │                                   (auth-input, card-base, wallet-card, etc.)
│   │
│   ├── (auth)/                       ← Auth Route Group (no layout wrapper)
│   │   └── login/
│   │       └── page.tsx              ← Login form (email + password, links to register)
│   │
│   ├── (user)/                       ← Player App Route Group
│   │   ├── layout.tsx                ← Sidebar (desktop) + BottomNav (mobile) wrapper
│   │   ├── home/
│   │   │   └── page.tsx              ← Dashboard: wallet summary + tournament cards
│   │   ├── wallet/
│   │   │   └── page.tsx              ← Wallet: balance cards + deposit/withdraw tabs
│   │   └── rank/
│   │       └── page.tsx              ← Leaderboard (ISR: revalidates every 24h)
│   │
│   └── (admin)/                      ← Super Admin Route Group
│       ├── layout.tsx                ← Dark sidebar + sticky topbar (mobile hamburger)
│       └── dashboard/
│           └── page.tsx              ← KPI stats, pending withdrawals, system health
│
├── actions/                          ← Next.js Server Actions ("use server")
│   ├── auth.ts                       ← registerNewUser() — Firestore mein user banao
│   ├── match.ts                      ← joinMatch(), updateMatchRoomDetails()
│   ├── wallet.ts                     ← createOrder(), verifyPayment() (Razorpay)
│   ├── wallet-server.ts              ← requestWithdrawal() — withdrawal + admin push
│   └── notifications.ts              ← Notification-related server actions
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx                ← Reusable button (Radix Slot + cn())
│   │   └── Skeleton.tsx              ← MatchCardSkeleton shimmer loader
│   └── user/
│       ├── Navigation.tsx            ← Sidebar (desktop) + BottomNav (mobile)
│       ├── AppStatusListener.tsx     ← Online/offline status listener
│       ├── NotificationBell.tsx      ← Bell icon with unread badge count
│       └── NotificationsProvider.tsx ← Firestore real-time notification listener
│
├── lib/
│   ├── firebase-admin.ts             ← Admin SDK init (lazy singleton pattern)
│   ├── firebase-client.ts            ← Client SDK init (persistent offline cache)
│   ├── fcm-server.ts                 ← sendTargetedPushNotification(), sendAdminPushNotification()
│   └── utils.ts                      ← cn() (class merger), formatCurrency() (INR)
│
├── proxy.ts                          ← Route protection (Next.js 16 middleware renamed)
├── next.config.ts                    ← serverExternalPackages: ["firebase-admin"]
├── tsconfig.json                     ← Next.js compatible TypeScript config
└── package.json                      ← npm scripts: dev -p 5000 -H 0.0.0.0
```

---

## 3. CORE LOGIC IMPLEMENTED

### A. proxy.ts — Route Protection
```
Pehle middleware.ts tha, Next.js 16 mein rename hokar proxy.ts ban gaya.

Kaam kya karta hai:
- Request aane par cookies padho: "session" aur "role"
- /admin/* → agar session nahi ya role !== "admin" → /login redirect
- /staff/* → agar role !== "staff" && role !== "admin" → /login redirect
- /login, /register → agar already logged in hain → role ke hisaab se dashboard redirect
- /home, /matches, /wallet, /profile → agar session nahi → /login redirect
```

### B. actions/wallet.ts — Razorpay Payment Flow
```
createOrder(amount, userId):
  → Razorpay SDK se order create karo (amount × 100 = paise)
  → Order ID client ko bhejo
  → Client Razorpay checkout kholega

verifyPayment(orderId, paymentId, signature, userId, amount):
  → HMAC-SHA256 se signature verify karo
  → Agar authentic hai:
    - Firestore Transaction: users/{uid}.wallets.deposit += amount
    - transactions collection mein log entry banao
    - revalidatePath("/wallet") — ISR cache invalidate karo
```

### C. actions/match.ts — Match Join Logic
```
joinMatch(matchId, userId, slot, ffName, ffUid):
  Firestore Transaction mein:
  1. Match full check (joinedUsers.length >= max)
  2. Slot already taken check
  3. User already joined check
  4. Wallet balance check:
     - Bonus se max 40% lelo
     - Baaki deposit/winning se lelo
     - Agar insufficient → error
  5. Wallets update (deposit, winning, bonus)
  6. Match document mein user add karo (arrayUnion)
  7. transactions log banao
  8. revalidatePath("matches/[id]") + "/home"

updateMatchRoomDetails(matchId, roomId, roomPass):
  → Match document update karo (roomId, roomPass, publishRoom: true)
  → Sirf us match ke joined players ko FCM push bhejo
```

### D. lib/fcm-server.ts — Push Notification System
```
sendTargetedPushNotification(userIds[], title, body):
  → Har user ka fcmToken Firestore se fetch karo
  → unreadNotificationCount atomic increment karo
  → Firebase Admin Messaging.sendEachForMulticast() call karo

sendAdminPushNotification(title, body):
  → Firestore mein role === "admin" wale sab users dhundo
  → unke userIds ko sendTargetedPushNotification() mein daalo

3 Triggers implemented:
  Trigger 1 → User withdrawal request kare → Admin ko push
  Trigger 2 → Naya user register kare → Admin ko "new player" push
  Trigger 3 → Staff room update kare → Sab joined players ko push
```

### E. lib/firebase-admin.ts — Lazy Singleton Pattern
```
getAdminApp():
  - Agar pehle se init hai → same instance return karo
  - Nahi hai → FIREBASE_SERVICE_ACCOUNT env var se JSON parse karo
  - Error → null return (graceful degradation)

getAdminDb() / getAdminAuth():
  - getAdminApp() call karo
  - Agar null → meaningful error throw karo
```

### F. lib/firebase-client.ts — Offline-First Setup
```
Firebase Client SDK:
  - initializeFirestore() with persistentLocalCache
  - persistentMultipleTabManager() — multiple tabs support
  - Iska matlab: user offline ho to bhi app kaam kare, sync ho jaye baad mein
```

---

## 4. ENVIRONMENT VARIABLES (.env setup)

Replit Secrets panel mein ye sab set karna zaroori hai:

| Variable | Description | Required |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Full Firebase Admin SDK JSON string | ✅ Critical |
| `RAZORPAY_KEY_ID` | Razorpay public key (`rzp_test_...`) | ✅ Critical |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | ✅ Critical |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook HMAC secret | ✅ For webhooks |
| `GEMINI_API_KEY` | Google Gemini AI key | ⚠️ Optional (AI features ke liye) |

**Firebase Client Config** (lib/firebase-client.ts mein hardcoded hai — ye public hai, theek hai):
- apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId

---

## 5. WHAT'S PENDING — CHECKLIST

### Pages Jo Abhi Nahi Bane
- [ ] `/register` — User registration page (auth action ready hai)
- [ ] `/matches` — Sab tournaments ki list (with filters: Live/Upcoming/Ended)
- [ ] `/matches/[id]` — Single match detail + slot selection + join button
- [ ] `/profile` — User profile, stats, match history
- [ ] `/admin/users` — User management table
- [ ] `/admin/tournaments` — Create/Edit/Delete tournaments
- [ ] `/admin/withdrawals` — Withdrawal approval flow
- [ ] `/admin/settings` — App settings, maintenance mode toggle
- [ ] `/staff/dashboard` — Room ID update form, match management
- [ ] `/admin/login` — Separate admin login
- [ ] `/staff/login` — Separate staff login

### Features Jo Abhi Implement Nahi Hue
- [ ] **Real Auth Integration** — Login/Register form Firebase Auth se connect karo, session cookie set karo
- [ ] **Razorpay Checkout** — Client-side Razorpay modal (createOrder → checkout → verifyPayment flow)
- [ ] **Transaction History** — Wallet page pe transactions list (Firestore se)
- [ ] **Offline Caching / ISR** — Matches list ke liye ISR (`revalidate = 300`)
- [ ] **Capacitor Push Setup** — Mobile app mein FCM token registration (`usePushNotifications` hook ready hai)
- [ ] **Notification Drawer** — Bell click karne par notifications list
- [ ] **Leaderboard Real Data** — `/rank` page abhi Firebase Admin se data leta hai (FIREBASE_SERVICE_ACCOUNT chahiye)
- [ ] **Maintenance Mode** — Admin toggle jo poora app band kar de
- [ ] **Staff Route Group** — `/(staff)` route group aur layout banana hai
- [ ] **Error Boundaries** — Page-level error.tsx files
- [ ] **Loading States** — loading.tsx skeleton files for each route

### Security / Production Hardening
- [ ] Server-side session validation (sirf cookie check nahi, actual token verify)
- [ ] Rate limiting on Server Actions
- [ ] Razorpay webhook signature validation (`/api/razorpay/webhook`)
- [ ] Input sanitization on all forms

---

*BattleZone Pro — Built for the elite. Document generated by Replit Agent.*
