export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  bank_account_number?: string | null;
  bank_account_masked?: string | null;
  bank_ifsc?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_coins: number;
  min_confidence_score: number;
  auto_approve_enabled: boolean;
  max_daily_per_user: number;
  icon: string;
  co2_offset_kg: number;
  is_active: boolean;
  created_at: string;
}

export type ActivityStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

export interface Activity {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  image_url: string;
  image_hash: string;
  ai_category_detected: string | null;
  ai_description: string | null;
  ai_confidence: number | null;
  ai_raw_result: any;
  is_suspicious: boolean;
  suspicion_reason?: string | null;
  duplicate_of_activity_id?: string | null;
  status: ActivityStatus;
  coins_awarded: number;
  admin_notes?: string | null;
  rejection_reason?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  // Joins
  category?: ActivityCategory;
  user?: Profile;
}

export interface WalletAccount {
  user_id: string;
  available_balance: number;
  lifetime_earned: number;
  total_redeemed: number;
  pending_balance: number;
  updated_at: string;
}

export type TransactionType =
  | 'ACTIVITY_REWARD'
  | 'CASH_REDEMPTION'
  | 'VOUCHER_REDEMPTION'
  | 'ADMIN_ADJUSTMENT'
  | 'REDEMPTION_REFUND';

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  reference_id: string | null;
  reference_type: string | null;
  description: string;
  created_at: string;
}

export type RewardType = 'cash' | 'voucher' | 'gift_card';

export interface Reward {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  type: RewardType;
  coin_cost: number;
  reward_value_inr: number;
  total_quantity: number;
  remaining_quantity: number;
  expiry_date?: string | null;
  is_active: boolean;
  redemption_limit_per_user: number;
  terms_and_conditions: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoucherCode {
  id: string;
  reward_id: string;
  code: string;
  is_redeemed: boolean;
  redeemed_by?: string | null;
  redeemed_at?: string | null;
  expiry_date?: string | null;
  created_at: string;
}

export type RedemptionStatus = 'requested' | 'processing' | 'paid' | 'rejected' | 'refunded';

export interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  type: RewardType;
  coins_spent: number;
  reward_value_inr: number;
  status: RedemptionStatus;
  bank_account_masked?: string | null;
  bank_ifsc?: string | null;
  utr_number?: string | null;
  voucher_code?: string | null;
  receipt_id: string;
  admin_notes?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
  updated_at: string;
  reward?: Reward;
  user?: Profile;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_entity: string;
  target_id: string;
  details: any;
  ip_address: string | null;
  created_at: string;
  actor?: Profile;
}

export interface SystemSettings {
  key: string;
  value: any;
  description: string | null;
  updated_at: string;
}

export interface PublicImpactStats {
  total_users: number;
  total_activities: number;
  approved_activities: number;
  pending_activities: number;
  coins_distributed: number;
  rewards_redeemed: number;
  estimated_co2_kg: number;
  trees_or_cleanups: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  verified_activities: number;
  co2_saved_kg: number;
}

export interface AIAnalysisResult {
  categorySlug: string;
  categoryName: string;
  detectedActivity: string;
  description: string;
  confidenceScore: number;
  isSuspicious: boolean;
  suspicionReason?: string;
  detectedObjects: string[];
  autoApproveEligible: boolean;
  estimatedCo2OffsetKg: number;
}
