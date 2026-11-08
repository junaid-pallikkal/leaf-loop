# LeafLoop (eco bonus) – Every Good Habit Counts

A complete, production-ready full-stack environmental rewards web application empowering individuals, students, and communities to capture daily environmental stewardship, receive real-time AI activity recognition, earn verified Leaf Coins (LC), and redeem coins for authentic bank cash payouts or brand vouchers.

---

## 🌟 Architecture & Highlights

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Database & Auth**: PostgreSQL 17 on Supabase with Row Level Security (RLS), atomic stored procedures (RPCs), and double-entry transaction ledgers
- **Storage**: Supabase Storage (`eco-evidence` bucket) with RLS access policies
- **AI Vision Engine**: Google Gemini Vision API (`@google/generative-ai`) paired with a robust built-in Computer Vision Heuristic Engine and cryptographic image hashing (SHA-256) for duplicate prevention
- **Design System**: Forest green (`#166534`), Leaf green (`#22C55E`), Background (`#F7FAF7`), dark green typography, minimal cards, and responsive layout
- **Voucher Receipts**: Native client-side PDF receipt generator using `jspdf` with tamper-evident receipt IDs (`LL-VCH-...` / `LL-CSH-...`)
- **Analytics & Visualizations**: Recharts data visualizations & CSV report exports for activities and financial payouts

---

## 🚀 Core Modules

### 1. Public Website
- **Landing Page** (`/`): Eco-hero section, real-time platform impact statistics counter, 3-step verification loop, category showcases, rewards preview, and verified citizen habit feed.
- **About LeafLoop** (`/about`): Detailed mission, tokenomics standard, and the two-tier verification philosophy (AI Vision + Administrator governance).
- **Public Impact Dashboard** (`/impact`): Real-time aggregated database metrics (verified actions, carbon avoided in kg, coins distributed, category breakdowns).
- **Public Leaderboard** (`/leaderboard`): Daily, weekly, monthly, and all-time rankings based on verified environmental contribution points (never wallet balance).
- **Rewards Overview** (`/rewards`): Transparent catalog of cash disbursements (IMPS/NEFT) and brand vouchers.

### 2. Authentication & Role Provisioning
- **Auth Routes**: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/callback`.
- **Automatic Account Trigger**: New signups automatically receive a personal profile, wallet account, and 50 Welcome Starter Leaf Coins via PostgreSQL trigger `on_auth_user_created`.
- **Secure Admin Provisioning**: Users can be securely elevated to administrator role via `/api/admin/promote` using the server secret key (`ADMIN_SECRET_KEY`) or by existing administrators.

### 3. User Workspace
- **Dashboard** (`/dashboard`): Available balance, lifetime earned, total redeemed, carbon offset, and recent submission queue.
- **Activity Capture** (`/dashboard/capture`): Mobile camera capture (`capture="environment"`) or desktop upload. Real-time AI analysis breakdown, confidence meter, and celebratory coin animations.
- **Activity History** (`/dashboard/activities`): Full history filterable by status (`Approved`, `Pending Review`, `Rejected`), high-res photo modal, AI confidence metrics, and administrator feedback.
- **Leaf Coin Wallet** (`/dashboard/wallet`): Real-time balance cards, cash conversion benchmark (1,000 LC = ₹10), and complete double-entry transaction ledger.
- **Rewards Store** (`/dashboard/store`): Dynamic catalog of cash payouts and brand vouchers. Interactive redemption flows with concurrent-safe voucher allocation and bank account masking.
- **Redemptions & Receipts** (`/dashboard/redemptions`): Track payout status (`Requested`, `Processing`, `Paid`, `Rejected`), reveal allocated voucher codes, and download official PDF receipts.
- **Profile Management** (`/dashboard/profile`): Update citizen details, default bank payout credentials, password changes, and admin authorization elevation.

### 4. AI Activity Recognition Engine
- **Endpoint**: `/api/ai/analyze`
- **Duplicate Detection**: Computes cryptographic image hash (SHA-256) and queries historical database entries to detect duplicate submissions.
- **Dual-Engine Vision**: Integrates Google Gemini Vision API for rich image understanding, falling back to a local heuristic computer vision engine evaluating image entropy, size, and category context.
- **Rule Verification**: Compares confidence scores against administrator-configured category thresholds. Eligible high-confidence activities auto-approve, while flagged or suspicious items route to the Admin queue.

### 5. Administrator Suite
- **Overview** (`/admin`): Real-time pending queue counts, payout audit requirements, and system metrics.
- **Submissions Workspace** (`/admin/submissions`): Side-by-side inspection, zoom preview, AI confidence details, duplicate alerts, approve/reject controls with custom coin overrides, and audit logging.
- **Cash Payouts Manager** (`/admin/payouts`): Manage bank disbursement requests, update status (`Processing`, `Paid` with UTR number, or `Rejected` with automatic wallet refund).
- **Rewards & Voucher Inventory** (`/admin/rewards`): Create/edit reward cards and bulk-load authentic voucher serial codes.
- **Categories & Rules** (`/admin/categories`): Adjust coin reward values, confidence thresholds, auto-approval toggles, and daily citizen limits.
- **Wallet Ledgers** (`/admin/wallets`): System-wide citizen account search, global transaction audit log, and promotional bonus grants.
- **Analytics & Reports** (`/admin/analytics`): Interactive Recharts visualizations and one-click CSV report exports.
- **System Settings** (`/admin/settings`): Configure cash conversion benchmarks, payout floor/ceiling limits, user processing notices, and AI sensitivity thresholds.

---

## 🔒 Security Architecture

1. **Row Level Security (RLS)**: Enforced across all tables (`profiles`, `activities`, `wallet_accounts`, `wallet_transactions`, `rewards`, `voucher_codes`, `redemptions`, `audit_logs`, `system_settings`).
2. **ACID Stored Procedures**: Balances are calculated and updated exclusively inside PostgreSQL functions (`request_cash_redemption`, `redeem_voucher_code`, `admin_process_cash_payout`, `admin_verify_activity`). Frontend balance modification is strictly prohibited.
3. **Banking Security**: Account numbers are automatically masked (`•••• •••• 1234`).
4. **Voucher Concurrency**: Uses `FOR UPDATE SKIP LOCKED` during code allocation to prevent race conditions or double claims.

---

## 🛠️ Environment Variables (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://oevwwmxqcbcatckfcjvo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_PROJECT_ID=oevwwmxqcbcatckfcjvo

NEXT_PUBLIC_APP_NAME=LeafLoop
NEXT_PUBLIC_APP_TAGLINE="Every Good Habit Counts"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Gemini Vision API key
GEMINI_API_KEY=

# System Administrator Provisioning Key
ADMIN_SECRET_KEY=leafloop_eco_admin_2026_secure
```

---

## 🧪 Verification & Testing

Run the automated platform test script to verify database connectivity, category loading, rewards inventory, RPC functions, AI vision engine, and PDF receipt generation:

```bash
npx tsx src/test/verify-platform.ts
```

Build for production:

```bash
npm run build
npm run start
```
