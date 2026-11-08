<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LeafLoop (eco bonus) — Agent Directives & Master Technical Specification

> **System Identity:** **eco bonus** (Platform: LeafLoop)  
> **Tagline:** *"Every Good Habit Counts."*  
> **System Purpose:** Enterprise-grade, production-ready environmental rewards web application and Progressive Web App (PWA) empowering individuals, students, and communities to document environmental actions, upload photographic evidence, receive automated AI vision verification, earn verified Leaf Coins (LC), and redeem rewards for cash payouts (direct bank transfer via IFSC/UTR tracking) or genuine retail/shopping vouchers with instant cryptographic PDF receipts.  
> **Target Audience:** AI Agents & Senior Full-Stack Engineers contributing to this codebase.

---

## 1. Core Operating Principles

1. **Inspect Before Changing:** Always inspect the repository and understand existing configurations, dependencies, and file structures before creating or modifying code. Never blow away or overwrite working code.
2. **Incremental Delivery & Build Safety:** Build one vertical slice at a time. The development server and production build (`npm run build`, `npx tsc --noEmit`) must remain green and error-free after every milestone.
3. **Verify, Never Guess:** Run TypeScript type checks, ESLint, and test commands directly in the shell. Never claim a task, module, or calculation engine is complete without verifying command output.
4. **Strict Zero Mock Data Policy (Real Database & State Only):**
   - Absolutely **NO placeholder mock arrays, synthetic hardcoded names, fake voucher codes, or simulated dummy records** anywhere in application views.
   - All data displayed across all portals (Public Landing, User Dashboard, Activity Feed, Wallet Ledger, Rewards Store, Leaderboard, and Admin Suite) must be queried directly from live PostgreSQL/Supabase database tables.
   - Empty states must render clean, actionable empty notices (e.g. *"No environmental activities logged yet. Capture your first action!"*, *"Wallet ledger is empty"*), never simulated synthetic rows.
5. **Real Functionality, Zero Stubs or Fake Features:**
   - Every single button, form submission, category filter, camera trigger, file upload, payout request, voucher claim, and Admin verification control must execute its actual backend logic.
   - Do not fabricate production analytics, payment confirmations, voucher codes, or AI detection results.
6. **AI as an Assistive Classifier, Not Proof of Real-World Truth:**
   - Photographic evidence submitted by users is processed through an AI Vision pipeline to detect category, activity type, descriptive content, confidence score, and potential duplicate/suspicious flags.
   - High-confidence, eligible activities may follow an automatic approval policy if configured by the Admin; all uncertain, low-confidence, or flagged submissions must route to the Admin Triage Queue for manual human verification.
   - Admin reserves authoritative override, classification correction, and reward adjustment capabilities with immutable audit logging.
7. **Server-Authoritative Security & Double-Entry Ledger Integrity:**
   - **Zero frontend balance manipulation:** User wallet balances cannot be computed or updated on the client. Every coin increment or decrement requires an atomic database transaction logged in an immutable `wallet_transactions` ledger table.
   - Role permissions (`user` vs `admin`) are enforced at the database level via PostgreSQL Row Level Security (RLS) policies and verified in Server Actions and Route Handlers. UI navigation hiding is UX, not security.
   - Cash redemptions enforce atomic balance holds, configurable conversion rates (default: `1000 LC = ₹110`), daily limits, and maximum redemption thresholds (default: `500 LC` per request).
   - Sensitive financial data (Bank Account numbers) must be handled securely (encrypted/masked as `••••••••1234` in UI and non-admin queries).
8. **Preserve Next.js Agent Rules:** The `<!-- BEGIN:nextjs-agent-rules -->` block at the top of this file is automatically maintained by Next.js tooling. Do not remove or alter it.

---

## 2. Technology Stack & Framework Conventions

| Layer | Technology | Version / Package | Guidelines |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `^15.1.0` or `^16.0.0` | React Server Components by default. Client components explicitly marked `'use client'`. Next.js async APIs (`params`, `searchParams`, `cookies()`, `headers()`) must always be awaited. |
| **Language** | TypeScript | `^5.0.0` | Strict mode enabled (`strict: true`). Zero `any` policy. All domain entities, calculation results, and forms have strict interfaces. |
| **Styling** | Tailwind CSS v4 | `@tailwindcss/postcss` / `@import "tailwindcss";` | Utility-first styling with bespoke environmental color tokens. Mobile-friendly touch targets ($\ge 44 \times 44\text{px}$). |
| **UI Components** | Radix UI + shadcn/ui | `@radix-ui/react-*` | Accessible primitives: Dialog, Sheet, Tabs, Popover, DropdownMenu, Tooltip, Select, Badge, Table, Alert, Card, Progress. |
| **Icons & Motion** | Lucide React + Motion | `lucide-react`, `motion` | Clean eco & financial icons (`Leaf`, `TreePine`, `Recycle`, `Coins`, `QrCode`, `ShieldCheck`, `Receipt`); subtle micro-interactions. |
| **Notifications** | Sonner | `sonner` | High-visibility toast notifications for submission status, wallet credits, and payout milestones. |
| **Database & Auth** | PostgreSQL + Supabase | `@supabase/ssr`, `@supabase/supabase-js` | Supabase Auth for authentication; PostgreSQL with granular Row Level Security (RLS) across all tables; RPC stored procedures for atomic balance updates. |
| **Storage** | Supabase Storage | `@supabase/storage-js` | Storage buckets: `activity-evidence` (public/authenticated upload with strict file limits) and `reward-assets`. |
| **AI Vision Engine** | AI Vision API / Gemini Flash | Structured Vision Pipeline | Analyzes photo submissions against configured environmental categories, extracts tags, computes confidence score (0.00–1.00), and flags suspicious images. |
| **Validation** | Zod | `zod ^3.24.0` | Unified schema validation for activity capture, bank details, voucher generation, and admin configuration. |
| **Forms** | React Hook Form + `@hookform/resolvers/zod` | `react-hook-form` | Responsive form handling, instant client validation, and server action binding. |
| **Charts & Metrics** | Recharts | `recharts ^2.15.0` | Environmental impact telemetry, submission velocity, category-wise breakdowns, and financial redemption volume. |
| **PDF Receipts** | jsPDF + jsPDF-autotable | `jspdf`, `jspdf-autotable` | High-resolution printable voucher certificates and cash payout handover receipts with QR codes and redemption credentials. |
| **QR Generation** | `qrcode.react` | `qrcode.react` | Generation of authentic verification QR codes embedded into downloadable PDF receipts. |

---

## 3. UI/UX Design System Specification

The design theme is **minimal, professional, and premium environmental technology**. Avoid generic AI-generated templates, tacky glowing glassmorphism, or excessive gradients.

### Color Palette

| Name | Hex / Class | Purpose |
|---|---|---|
| **Forest Green (Primary)** | `#166534` (`emerald-800` / `green-800`) | Primary brand color, headers, primary buttons, admin accents |
| **Leaf Green (Accent)** | `#22C55E` (`emerald-500` / `green-500`) | Vibrant interactive accents, badges, verified indicators, active tab indicators |
| **Mint / Eco Tint** | `#DCFCE7` / `#F0FDF4` | Subtle highlights, active state backgrounds, callout containers |
| **Canvas Background** | `#F7FAF7` | Clean, high-contrast eco background across public and authenticated portals |
| **Card Surface** | `#FFFFFF` | Crisp white elevated cards with subtle border `#E2E8F0` or `#E5E7EB` |
| **Dark Green / Typography** | `#14532D` / `#0F172A` | Deep forest and slate tones for high readability and professional typography |
| **Muted Text** | `#64748B` | Labels, helper text, and secondary timestamps |
| **Alert / Danger** | `#EF4444` | Rejection alerts, payout cancellation, validation errors |
| **Warning / Pending** | `#F59E0B` | Pending AI analysis, admin review required, processing payouts |

---

## 4. Project Directory Structure

```text
eco-bonus/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                     # Landing page (Hero, stats, how it works, live calculator)
│   │   │   ├── about/page.tsx               # About LeafLoop mission, roadmap & environmental ethos
│   │   │   ├── impact/page.tsx              # Public real-time environmental impact dashboard
│   │   │   ├── leaderboard/page.tsx         # Public global & community rankings
│   │   │   ├── rewards/page.tsx             # Public preview of available cash & voucher rewards
│   │   │   └── layout.tsx                   # Public navigation header, footer, CTA
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx               # Secure role-aware login (User / Admin)
│   │   │   ├── register/page.tsx            # New member registration
│   │   │   ├── reset-password/page.tsx      # Password recovery & reset confirmation
│   │   │   └── layout.tsx                   # Eco-themed auth shell
│   │   ├── (user)/
│   │   │   ├── layout.tsx                   # User authenticated layout (sidebar/bottom nav, coin pill, notifications)
│   │   │   ├── dashboard/page.tsx           # User command center (summary, streak, pending submissions, quick capture)
│   │   │   ├── capture/page.tsx             # Camera capture / image upload, metadata form, location tag
│   │   │   ├── activities/
│   │   │   │   ├── page.tsx                 # Activity history, status filters (Pending, AI Approved, Verified, Rejected)
│   │   │   │   └── [id]/page.tsx            # Activity submission detail with AI breakdown & verification badge
│   │   │   ├── wallet/page.tsx              # Leaf Coin wallet, balances, ledger history, transaction receipts
│   │   │   ├── store/
│   │   │   │   ├── page.tsx                 # Rewards store grid (Cash cards, retail vouchers, filter by category/cost)
│   │   │   │   └── [rewardId]/page.tsx      # Dynamic reward detail & terms
│   │   │   ├── redeem/
│   │   │   │   ├── cash/page.tsx            # Cash payout form (Bank account, IFSC, confirmation, exchange calculator)
│   │   │   │   └── voucher/[id]/page.tsx    # Voucher claim, instant code display, PDF receipt download
│   │   │   ├── leaderboard/page.tsx         # User in-app competitive leaderboard (Daily/Weekly/Monthly/All-Time)
│   │   │   ├── analytics/page.tsx           # Personal environmental footprint, carbon offset estimations, coin velocity
│   │   │   └── profile/page.tsx             # Profile settings, notification preferences, banking details preset
│   │   ├── (admin)/
│   │   │   ├── layout.tsx                   # Admin high-security workspace shell (sidebar, live pending counts)
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/page.tsx       # System overview, global telemetry, verification throughput, financial totals
│   │   │   │   ├── submissions/
│   │   │   │   │   ├── page.tsx             # Submissions review queue (side-by-side photo, AI results, confidence)
│   │   │   │   │   └── [id]/page.tsx        # Granular verification inspector: override classification, approve/reject
│   │   │   │   ├── users/
│   │   │   │   │   ├── page.tsx             # User management, role elevation, suspension, balance inspection
│   │   │   │   │   └── [userId]/page.tsx    # Single user audit trail & activity log
│   │   │   │   ├── categories/page.tsx      # Environmental categories, point multipliers, AI detection rules
│   │   │   │   ├── ai-settings/page.tsx     # AI model thresholds, duplicate sensitivity, confidence gating
│   │   │   │   ├── coins/page.tsx           # Coin economy config: reward rates, daily caps, conversion rate (1000 LC = ₹110)
│   │   │   │   ├── ledger/page.tsx          # Global immutable transaction ledger & discrepancy audit
│   │   │   │   ├── rewards/
│   │   │   │   │   ├── page.tsx             # Rewards catalog management (create/edit cards, stock, validity)
│   │   │   │   │   └── inventory/page.tsx   # Voucher code inventory management (bulk import unredeemed codes)
│   │   │   │   ├── payouts/page.tsx         # Cash payout request queue (Review, Approve, Mark Paid with UTR reference)
│   │   │   │   ├── analytics/page.tsx       # Platform analytics, AI accuracy rate, financial outflow, retention
│   │   │   │   └── settings/page.tsx        # System operational settings & environment health
│   │   └── api/
│   │       ├── ai/verify/route.ts           # AI Vision analysis API route
│   │       ├── webhooks/route.ts            # Supabase / external webhooks
│   │       └── export/route.ts              # Data export handlers
│   ├── components/
│   │   ├── ui/                              # shadcn primitives
│   │   ├── public/                          # Landing page sections & impact counters
│   │   ├── activity/                        # Camera capture, image upload dropzone, AI result card
│   │   ├── wallet/                          # Coin balance badge, ledger table, payout status chips
│   │   ├── rewards/                         # Dynamic reward cards, voucher receipt modal
│   │   ├── admin/                           # Triage cards, verification inspector, UTR entry dialog
│   │   └── shared/                          # Navigation bars, user avatars, empty states, breadcrumbs
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                    # Browser Supabase client
│   │   │   ├── server.ts                    # Server component & action Supabase client
│   │   │   └── middleware.ts                # Session refresh & route protection middleware
│   │   ├── ai/
│   │   │   ├── vision.ts                    # AI Vision API client & structured JSON schema prompts
│   │   │   └── rules.ts                     # Rule evaluation engine (confidence, thresholds, duplicate detection)
│   │   ├── wallet/
│   │   │   └── ledger.ts                    # Atomic transaction ledger services & balance calculators
│   │   ├── pdf/
│   │   │   └── voucher-receipt.ts           # jsPDF voucher receipt layout generator
│   │   ├── validators/                      # Zod schemas (activity, bank, reward, settings)
│   │   └── utils.ts                         # Formatting, currency conversion, date formatting
│   └── types/                               # TypeScript domain entities & database definitions
```

---

## 5. Complete Database Architecture (PostgreSQL / Supabase Schema)

The database design strictly enforces relational integrity, auditability, double-entry ledger bookkeeping, and Row Level Security.

### Table 1: `profiles`
Extends `auth.users` with application profile data, environmental contribution points, and role credentials.
- `id`: `uuid primary key references auth.users(id) on delete cascade`
- `email`: `text not null unique`
- `full_name`: `text not null`
- `phone_number`: `text`
- `avatar_url`: `text`
- `role`: `text not null default 'user' check (role in ('user', 'admin'))`
- `total_points`: `integer not null default 0 check (total_points >= 0)` (Lifetime verified contribution points for leaderboard ranking)
- `current_streak_days`: `integer not null default 0`
- `last_activity_date`: `date`
- `created_at`: `timestamptz not null default now()`
- `updated_at`: `timestamptz not null default now()`

### Table 2: `activity_categories`
Administrator-configured environmental categories with coin reward rates and AI detection parameters.
- `id`: `uuid primary key default gen_random_uuid()`
- `name`: `text not null unique` (e.g. "Tree Plantation", "Waste Segregation & Recycling", "Public Cleanliness Drive", "Solar & Energy Conservation", "Bicycle & Green Commute")
- `slug`: `text not null unique`
- `description`: `text not null`
- `icon_name`: `text not null default 'Leaf'`
- `base_coin_reward`: `integer not null default 50 check (base_coin_reward > 0)`
- `impact_unit`: `text not null` (e.g. "kg CO2 offset", "kg waste recycled", "trees planted", "km cycled")
- `impact_per_unit`: `numeric(10, 2) not null default 1.0`
- `min_confidence_threshold`: `numeric(3, 2) not null default 0.80 check (min_confidence_threshold between 0.00 and 1.00)`
- `daily_submission_limit`: `integer not null default 3 check (daily_submission_limit > 0)`
- `is_active`: `boolean not null default true`
- `created_at`: `timestamptz not null default now()`
- `updated_at`: `timestamptz not null default now()`

### Table 3: `activity_submissions`
Stores photographic evidence submissions, AI analysis output, and human review decisions.
- `id`: `uuid primary key default gen_random_uuid()`
- `user_id`: `uuid not null references profiles(id) on delete cascade`
- `category_id`: `uuid references activity_categories(id) on delete set null`
- `image_url`: `text not null`
- `image_hash`: `text` (Perceptual or cryptographic hash for near-duplicate detection)
- `description`: `text not null`
- `location_name`: `text`
- `location_lat`: `numeric(10, 7)`
- `location_lng`: `numeric(10, 7)`
- `ai_detected_category`: `text`
- `ai_confidence_score`: `numeric(3, 2) check (ai_confidence_score between 0.00 and 1.00)`
- `ai_description`: `text`
- `ai_tags`: `text[] default '{}'`
- `ai_raw_response`: `jsonb`
- `is_suspicious`: `boolean not null default false`
- `suspicion_reasons`: `text[] default '{}'`
- `status`: `text not null default 'pending_ai' check (status in ('pending_ai', 'pending_admin', 'approved', 'rejected'))`
- `rejection_reason`: `text`
- `reviewed_by`: `uuid references profiles(id) on delete set null` (Admin user ID)
- `reviewed_at`: `timestamptz`
- `coins_awarded`: `integer not null default 0 check (coins_awarded >= 0)`
- `points_awarded`: `integer not null default 0 check (points_awarded >= 0)`
- `created_at`: `timestamptz not null default now()`
- `updated_at`: `timestamptz not null default now()`

### Table 4: `wallet_accounts`
Authoritative summary state of a user's wallet. Never mutated directly by client requests.
- `id`: `uuid primary key default gen_random_uuid()`
- `user_id`: `uuid not null unique references profiles(id) on delete cascade`
- `available_coins`: `integer not null default 0 check (available_coins >= 0)`
- `lifetime_earned`: `integer not null default 0 check (lifetime_earned >= 0)`
- `total_redeemed`: `integer not null default 0 check (total_redeemed >= 0)`
- `pending_coins`: `integer not null default 0 check (pending_coins >= 0)`
- `updated_at`: `timestamptz not null default now()`

### Table 5: `wallet_transactions`
The immutable double-entry transaction ledger.
- `id`: `uuid primary key default gen_random_uuid()`
- `user_id`: `uuid not null references profiles(id) on delete cascade`
- `amount`: `integer not null check (amount <> 0)` (Positive for earnings/refunds, negative for redemptions)
- `balance_after`: `integer not null check (balance_after >= 0)`
- `type`: `text not null check (type in ('EARN_ACTIVITY', 'REDEEM_CASH', 'REDEEM_VOUCHER', 'ADMIN_OVERRIDE', 'REFUND_PAYOUT'))`
- `reference_id`: `text` (UUID string of submission, payout request, or voucher claim)
- `description`: `text not null`
- `created_at`: `timestamptz not null default now()`

### Table 6: `rewards`
Dynamic rewards catalog managed by Admins (Cash cards, retail vouchers, gift cards).
- `id`: `uuid primary key default gen_random_uuid()`
- `name`: `text not null`
- `slug`: `text not null unique`
- `description`: `text not null`
- `image_url`: `text not null`
- `reward_type`: `text not null check (reward_type in ('cash', 'shopping_voucher', 'gift_card'))`
- `coin_cost`: `integer not null check (coin_cost > 0)`
- `reward_value_inr`: `numeric(10, 2) not null check (reward_value_inr >= 0)`
- `stock_quantity`: `integer not null default 100 check (stock_quantity >= 0)`
- `expiry_days`: `integer not null default 90 check (expiry_days > 0)`
- `is_active`: `boolean not null default true`
- `redemption_limit_per_user`: `integer not null default 5`
- `terms_conditions`: `text not null`
- `created_at`: `timestamptz not null default now()`
- `updated_at`: `timestamptz not null default now()`

### Table 7: `voucher_codes`
Specific unredeemed and redeemed codes for shopping vouchers and gift cards.
- `id`: `uuid primary key default gen_random_uuid()`
- `reward_id`: `uuid not null references rewards(id) on delete cascade`
- `code`: `text not null`
- `is_redeemed`: `boolean not null default false`
- `redeemed_by_user_id`: `uuid references profiles(id) on delete set null`
- `redeemed_at`: `timestamptz`
- `created_at`: `timestamptz not null default now()`
- `unique (reward_id, code)`

### Table 8: `cash_redemptions`
Payout requests for direct bank transfers via NEFT/IMPS.
- `id`: `uuid primary key default gen_random_uuid()`
- `user_id`: `uuid not null references profiles(id) on delete cascade`
- `coins_redeemed`: `integer not null check (coins_redeemed > 0)`
- `amount_inr`: `numeric(10, 2) not null check (amount_inr > 0)`
- `conversion_rate`: `numeric(6, 4) not null` (e.g. 0.1100 representing 1000 LC = ₹110)
- `bank_account_number`: `text not null` (Masked/encrypted at rest)
- `bank_account_last4`: `text not null check (length(bank_account_last4) = 4)`
- `ifsc_code`: `text not null check (length(ifsc_code) = 11)`
- `account_holder_name`: `text not null`
- `status`: `text not null default 'requested' check (status in ('requested', 'processing', 'paid', 'rejected', 'refunded'))`
- `payment_reference_utr`: `text` (Unique Transaction Reference populated upon payout)
- `admin_notes`: `text`
- `processed_by`: `uuid references profiles(id) on delete set null`
- `processed_at`: `timestamptz`
- `created_at`: `timestamptz not null default now()`
- `updated_at`: `timestamptz not null default now()`

### Table 9: `voucher_redemptions`
User voucher claims and generated receipt references.
- `id`: `uuid primary key default gen_random_uuid()`
- `user_id`: `uuid not null references profiles(id) on delete cascade`
- `reward_id`: `uuid not null references rewards(id) on delete cascade`
- `voucher_code_id`: `uuid not null references voucher_codes(id) on delete cascade`
- `coins_redeemed`: `integer not null check (coins_redeemed > 0)`
- `voucher_code_revealed`: `text not null`
- `expires_at`: `timestamptz not null`
- `pdf_receipt_url`: `text`
- `created_at`: `timestamptz not null default now()`

### Table 10: `system_settings`
Key-value configuration store for financial conversion rates, daily caps, and AI parameters.
- `key`: `text primary key`
- `value`: `jsonb not null`
- `description`: `text`
- `updated_by`: `uuid references profiles(id) on delete set null`
- `updated_at`: `timestamptz not null default now()`

*Default configuration entries:*
- `'coins.conversion_rate_inr'`: `{"coins_unit": 1000, "inr_value": 110.00}` (1000 LC = ₹110)
- `'coins.max_redemption_per_request'`: `{"max_coins": 500}`
- `'coins.daily_max_earning'`: `{"max_coins": 500}`
- `'ai.auto_approval_enabled'`: `{"enabled": true, "min_confidence": 0.85}`
- `'ai.duplicate_check_days'`: `{"days": 30}`

### Table 11: `admin_audit_logs`
Tracks every administrative action, approval, rejection, and manual ledger adjustment.
- `id`: `uuid primary key default gen_random_uuid()`
- `admin_id`: `uuid not null references profiles(id) on delete cascade`
- `action`: `text not null` (e.g. "APPROVE_SUBMISSION", "REJECT_SUBMISSION", "OVERRIDE_REWARD", "APPROVE_CASH_PAYOUT", "UPDATE_SYSTEM_SETTINGS")
- `target_entity`: `text not null` (e.g. "activity_submissions", "cash_redemptions", "rewards")
- `target_id`: `text not null`
- `previous_state`: `jsonb`
- `new_state`: `jsonb`
- `ip_address`: `text`
- `created_at`: `timestamptz not null default now()`

---

## 6. Domain Models & Core TypeScript Interfaces

```typescript
// types/eco.ts

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  total_points: number;
  current_streak_days: number;
  last_activity_date?: string | null;
  created_at: string;
}

export interface ActivityCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  base_coin_reward: number;
  impact_unit: string;
  impact_per_unit: number;
  min_confidence_threshold: number;
  daily_submission_limit: number;
  is_active: boolean;
}

export type SubmissionStatus = 'pending_ai' | 'pending_admin' | 'approved' | 'rejected';

export interface ActivitySubmission {
  id: string;
  user_id: string;
  category_id?: string | null;
  image_url: string;
  image_hash?: string | null;
  description: string;
  location_name?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  ai_detected_category?: string | null;
  ai_confidence_score?: number | null;
  ai_description?: string | null;
  ai_tags: string[];
  ai_raw_response?: Record<string, unknown> | null;
  is_suspicious: boolean;
  suspicion_reasons: string[];
  status: SubmissionStatus;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  coins_awarded: number;
  points_awarded: number;
  created_at: string;
  user?: UserProfile;
  category?: ActivityCategory;
}

export interface WalletAccount {
  id: string;
  user_id: string;
  available_coins: number;
  lifetime_earned: number;
  total_redeemed: number;
  pending_coins: number;
  updated_at: string;
}

export type TransactionType =
  | 'EARN_ACTIVITY'
  | 'REDEEM_CASH'
  | 'REDEEM_VOUCHER'
  | 'ADMIN_OVERRIDE'
  | 'REFUND_PAYOUT';

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  type: TransactionType;
  reference_id?: string | null;
  description: string;
  created_at: string;
}

export type RewardType = 'cash' | 'shopping_voucher' | 'gift_card';

export interface Reward {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  reward_type: RewardType;
  coin_cost: number;
  reward_value_inr: number;
  stock_quantity: number;
  expiry_days: number;
  is_active: boolean;
  redemption_limit_per_user: number;
  terms_conditions: string;
}

export type PayoutStatus = 'requested' | 'processing' | 'paid' | 'rejected' | 'refunded';

export interface CashRedemption {
  id: string;
  user_id: string;
  coins_redeemed: number;
  amount_inr: number;
  conversion_rate: number;
  bank_account_last4: string;
  ifsc_code: string;
  account_holder_name: string;
  status: PayoutStatus;
  payment_reference_utr?: string | null;
  admin_notes?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
  user?: UserProfile;
}

export interface VoucherRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  voucher_code_id: string;
  coins_redeemed: number;
  voucher_code_revealed: string;
  expires_at: string;
  pdf_receipt_url?: string | null;
  created_at: string;
  reward?: Reward;
}
```

---

## 7. AI Activity Recognition Engine Specifications

When a user submits an environmental photo:

1. **Structured Vision Prompt:** The server sends the image along with the active category catalog to the AI Vision model.
2. **Strict JSON Schema Output:**
```json
{
  "detected_category_slug": "tree-plantation",
  "is_environmental_action": true,
  "confidence_score": 0.94,
  "description": "User planting a neem sapling in moist garden soil with gardening trowel.",
  "detected_objects": ["sapling", "soil", "trowel", "hands", "outdoor garden"],
  "is_suspicious": false,
  "suspicion_flags": []
}
```
3. **Suspicion Checks:**
   - Detects digital screens / monitor re-photographing.
   - Detects internet stock photo watermarks or stock photo artifacts.
   - Detects unrelated indoor/commercial objects with no environmental habit.
4. **Automated Verification Pipeline:**
   - Let $C$ be the AI confidence score and $T_{cat}$ be the category's minimum confidence threshold (default 0.80).
   - If `is_environmental_action == true` AND $C \ge T_{cat}$ AND `is_suspicious == false` AND Admin has enabled auto-approval:
     - Mark status as `approved`.
     - Award `base_coin_reward` to the user's wallet via atomic ledger RPC.
     - Increment user's `total_points` by `base_coin_reward`.
     - Update daily streak if applicable.
   - Otherwise:
     - Mark status as `pending_admin`.
     - Reason logged in `suspicion_reasons` or "Confidence below threshold ($C < T_{cat}$)".
     - Submission appears in Admin Verification Queue.

---

## 8. Leaf Coin Economy, Conversion & Ledger Math

### Conversion Formula
The cash value of Leaf Coins is defined by an administrator-configurable conversion rate:
$$\text{INR Value} = \text{Leaf Coins} \times \left( \frac{\text{Conversion Rate INR}}{\text{Base Coins Unit}} \right)$$

*Default Parameters:*
- `Base Coins Unit` = $1000\text{ LC}$
- `Conversion Rate INR` = $₹110.00$
- Unit Value = $₹0.1100$ per Leaf Coin.
- Example: $500\text{ LC} \times 0.11 = ₹55.00$.

### Atomic Transaction Execution
To prevent race conditions, double redemptions, or negative balances, wallet operations execute via a PostgreSQL stored procedure (`process_wallet_transaction`):
1. Rows in `wallet_accounts` are locked with `FOR UPDATE`.
2. Validates `available_coins + amount >= 0`.
3. Inserts a row into `wallet_transactions`.
4. Updates `wallet_accounts` (`available_coins = available_coins + amount`, adjusts `lifetime_earned` or `total_redeemed`).

---

## 9. Role-Based Portals & Operational Workflows

### 1. Public Portal (Unauthenticated)
- **Landing Page (`/`):** Dynamic hero with live platform impact numbers (total actions, kilograms of CO2 offset, trees planted), step-by-step "How It Works" carousel, and interactive rewards preview.
- **Environmental Impact Dashboard (`/impact`):** Live aggregated metrics queried directly from database tables (`COUNT(approved_submissions)`, `SUM(impact)`).
- **Public Leaderboard (`/leaderboard`):** Community ranking tabs (Daily, Weekly, Monthly, All-time) displaying rank, user avatar, obfuscated name/display name, and verified points.
- **Rewards Showcase (`/rewards`):** Catalog of cash payout tiers and authentic brand shopping vouchers.

### 2. User Authenticated Portal
- **Dashboard (`/dashboard`):** Real-time coin balance badge, current streak flame, recent activity status feed, quick action button to "Log Activity".
- **Capture Activity (`/capture`):** HTML5 camera feed or file picker, category selector, descriptive notes, and optional geolocation tagging. Shows live upload progress and instant AI feedback modal.
- **Activity Detail & History (`/activities`):** Visual timeline with filter chips (`All`, `Pending Verification`, `Approved`, `Flagged`). Clicking an item reveals photo, AI recognition tags, confidence score, and review badge.
- **Coin Wallet (`/wallet`):** Balance breakdown (`Available`, `Pending`, `Lifetime Earned`, `Total Redeemed`), transaction ledger table with search and type filters.
- **Rewards Store (`/store`):** Browse dynamic cards categorized by Cash, Shopping Vouchers, and Gift Cards. Displays coin cost, cash equivalent, and remaining stock.
- **Cash Redemption (`/redeem/cash`):** Secure form validating Bank Account Number, Confirm Account Number, and IFSC code (verified with standard regex `^[A-Z]{4}0[A-Z0-9]{6}$`). Shows instant payout estimate and processing message.
- **Voucher Redemption (`/redeem/voucher/[id]`):** Confirmation modal to redeem voucher. Generates instant single-use code from inventory and provides a one-click button to download a branded **PDF Voucher Certificate**.
- **Personal Analytics (`/analytics`):** Interactive Recharts showing monthly activity frequency, category distribution donut, and carbon offset timeline.

### 3. Admin Command Center (`/admin`)
- **System Overview (`/admin/dashboard`):** Real-time operational metrics: Pending submissions count, payout requests queue, total coins in circulation, AI accuracy rate, and monthly financial outflow.
- **Verification Queue (`/admin/submissions`):** Side-by-side inspection view: user photo, AI confidence bar, detected tags, duplicate risk indicator. Actions: **Approve**, **Reject** (with predefined or custom reason), **Reclassify Category**, or **Override Coin Amount**.
- **Cash Payout Queue (`/admin/payouts`):** List of requested payouts. Admin can mark as `Processing`, input the bank **UTR / Payment Reference Number** upon successful transfer, and mark as `Paid` (or `Reject & Refund` with automated coin reversal).
- **Rewards & Inventory Manager (`/admin/rewards`):** Create new reward cards, upload voucher stock, edit coin pricing, and adjust stock quantities.
- **Category & Economy Settings (`/admin/categories` & `/admin/coins`):** Adjust base coin rewards, confidence thresholds, conversion rates, and daily limits.
- **Security Audit Logs (`/admin/ledger`):** Complete immutable record of all wallet ledger mutations and administrative overrides.

---

## 10. Row Level Security (RLS) & Authorization Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Public (Display fields only) / User (Own) / Admin (All) | Trigger on `auth.users` | User (Own non-role fields) / Admin (All) | Admin only |
| `activity_categories` | Public (if `is_active = true`) / Admin (All) | Admin only | Admin only | Admin only |
| `activity_submissions`| User (Own) / Admin (All) / Public (if `status = 'approved'`) | User (Own, authenticated) | Admin only (Review decisions) | Admin only |
| `wallet_accounts` | User (Own) / Admin (All) | RPC / Server Action | RPC / Server Action | Forbidden |
| `wallet_transactions`| User (Own) / Admin (All) | RPC / Server Action | Forbidden (Immutable) | Forbidden |
| `rewards` | Public (if `is_active = true`) / Admin (All) | Admin only | Admin only | Admin only |
| `voucher_codes` | Admin only (Unredeemed) / User (Own redeemed) | Admin only | RPC / Server Action | Admin only |
| `cash_redemptions` | User (Own) / Admin (All) | User (Own, validated) | Admin only (Status updates) | Admin only |
| `voucher_redemptions`| User (Own) / Admin (All) | User (Own, via RPC) | Admin only | Admin only |
| `system_settings` | Public (Whitelisted keys) / Admin (All) | Admin only | Admin only | Admin only |
| `admin_audit_logs` | Admin only | Server Action only | Forbidden (Immutable) | Forbidden |

---

## 11. Verification & Quality Commands

AI agents and developers working on this repository must execute and pass the following quality commands before marking any feature or milestone complete:

```bash
# 1. Typecheck the entire project with strict compiler flags
npx tsc --noEmit

# 2. Run ESLint across all source files
npm run lint

# 3. Verify clean production build output
npm run build

# 4. Check for uncommitted agent artifacts or breaking changes
git status
```

---

## 12. Phased Implementation Roadmap

1. **Milestone 1 — Architecture & Core Foundations:** Next.js App Router scaffolding, Supabase database schema migrations, RLS policies, TypeScript interfaces, and Tailwind CSS eco-theme tokens.
2. **Milestone 2 — Authentication & Role Guarding:** Supabase Auth with email verification, password reset, middleware route protection, and admin role elevation.
3. **Milestone 3 — Public Experience & Impact Dashboard:** High-conversion landing page, live environmental metrics counter, public leaderboard, and rewards showcase.
4. **Milestone 4 — Activity Capture & AI Vision Pipeline:** Camera/upload component, image optimization, AI vision analysis, category classification, confidence scoring, and duplicate detection.
5. **Milestone 5 — Wallet Engine & Double-Entry Ledger:** Immutable `wallet_transactions` ledger, atomic balance updates via stored procedures, and user wallet views.
6. **Milestone 6 — Rewards Store, Cash Payouts & PDF Receipts:** Dynamic rewards catalog, bank transfer payout request machine with IFSC validation, genuine voucher allocation, and client-side jsPDF receipt generation.
7. **Milestone 7 — Admin Verification Suite & Telemetry:** Triage queue for pending activities, AI override tools, payout processing with UTR tracking, category/reward editors, and platform analytics.
8. **Milestone 8 — End-to-End Verification & Production Readiness:** Rigorous automated validation, mobile responsiveness testing, PWA manifest setup, and zero-error production build.
