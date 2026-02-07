// WARNING: Types created manually from SQL schema (Docker unavailable for supabase gen types)
// MUST regenerate when Docker is available: supabase gen types typescript --local > src/types/database.ts
// Last synced with: supabase/migrations/00001-00011 (2026-02-05)

export type Plan = "free" | "pro" | "business" | "enterprise";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";

// Sandbox types
export type SandboxStatus =
  | "pending"
  | "provisioning"
  | "setup"
  | "applying_code"
  | "installing_packages"
  | "validating"
  | "repairing"
  | "ready"
  | "failed"
  | "terminated";

export type SandboxProviderType = "e2b" | "vercel";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          role: "admin" | "collaborateur";
          invited_at: string;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id: string;
          role: "admin" | "collaborateur";
          invited_at?: string;
          joined_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          org_id?: string;
          role?: "admin" | "collaborateur";
          invited_at?: string;
          joined_at?: string | null;
        };
      };
      tools: {
        Row: {
          id: string;
          org_id: string;
          created_by: string;
          name: string;
          description: string | null;
          status: "draft" | "ready" | "generating" | "active" | "disabled";
          artifact: Json | null;
          code_storage_path: string | null;
          access_type: "public" | "restricted";
          access_code_hash: string | null;
          deployed_url: string | null;
          deployed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          created_by: string;
          name: string;
          description?: string | null;
          status?: "draft" | "ready" | "generating" | "active" | "disabled";
          artifact?: Json | null;
          code_storage_path?: string | null;
          access_type?: "public" | "restricted";
          access_code_hash?: string | null;
          deployed_url?: string | null;
          deployed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          created_by?: string;
          name?: string;
          description?: string | null;
          status?: "draft" | "ready" | "generating" | "active" | "disabled";
          artifact?: Json | null;
          code_storage_path?: string | null;
          access_type?: "public" | "restricted";
          access_code_hash?: string | null;
          deployed_url?: string | null;
          deployed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      generations: {
        Row: {
          id: string;
          tool_id: string;
          triggered_by: string;
          status: "pending" | "streaming" | "complete" | "failed";
          provider: string | null;
          model: string | null;
          tokens_used: number | null;
          duration_ms: number | null;
          cost_estimate: number | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          triggered_by: string;
          status?: "pending" | "streaming" | "complete" | "failed";
          provider?: string | null;
          model?: string | null;
          tokens_used?: number | null;
          duration_ms?: number | null;
          cost_estimate?: number | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          triggered_by?: string;
          status?: "pending" | "streaming" | "complete" | "failed";
          provider?: string | null;
          model?: string | null;
          tokens_used?: number | null;
          duration_ms?: number | null;
          cost_estimate?: number | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
    };
      profiles: {
        Row: {
          id: string;
          plan: Plan;
          stripe_customer_id: string | null;
          tools_active_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          plan?: Plan;
          stripe_customer_id?: string | null;
          tools_active_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan?: Plan;
          stripe_customer_id?: string | null;
          tools_active_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          plan: Plan;
          status: SubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          plan: Plan;
          status: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          stripe_customer_id?: string;
          plan?: Plan;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      plan_limits: {
        Row: {
          plan: Plan;
          max_active_tools: number | null;
          max_regenerations_per_month: number | null;
          max_proxy_calls_per_day: number | null;
          ai_model: string;
          can_deploy: boolean;
          badge_required: boolean;
        };
        Insert: {
          plan: Plan;
          max_active_tools?: number | null;
          max_regenerations_per_month?: number | null;
          max_proxy_calls_per_day?: number | null;
          ai_model: string;
          can_deploy?: boolean;
          badge_required?: boolean;
        };
        Update: {
          plan?: Plan;
          max_active_tools?: number | null;
          max_regenerations_per_month?: number | null;
          max_proxy_calls_per_day?: number | null;
          ai_model?: string;
          can_deploy?: boolean;
          badge_required?: boolean;
        };
      };
      sandboxes: {
        Row: {
          id: string;
          tool_id: string;
          generation_id: string | null;
          provider: SandboxProviderType;
          external_id: string | null;
          url: string | null;
          status: SandboxStatus;
          retry_count: number;
          max_retries: number;
          last_error: string | null;
          error_history: Json;
          build_passed: boolean | null;
          tests_passed: boolean | null;
          health_check_passed: boolean | null;
          created_at: string;
          updated_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          tool_id: string;
          generation_id?: string | null;
          provider: SandboxProviderType;
          external_id?: string | null;
          url?: string | null;
          status?: SandboxStatus;
          retry_count?: number;
          max_retries?: number;
          last_error?: string | null;
          error_history?: Json;
          build_passed?: boolean | null;
          tests_passed?: boolean | null;
          health_check_passed?: boolean | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          tool_id?: string;
          generation_id?: string | null;
          provider?: SandboxProviderType;
          external_id?: string | null;
          url?: string | null;
          status?: SandboxStatus;
          retry_count?: number;
          max_retries?: number;
          last_error?: string | null;
          error_history?: Json;
          build_passed?: boolean | null;
          tests_passed?: boolean | null;
          health_check_passed?: boolean | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string | null;
        };
      };
    Functions: {
      is_org_member: {
        Args: { check_org_id: string };
        Returns: boolean;
      };
      is_org_admin: {
        Args: { check_org_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}
