import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (uses anon key + RLS) — lazy so build works without env vars
let _supabase: ReturnType<typeof createClient> | null = null;
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}
/** @deprecated use getSupabase() */
export const supabase: ReturnType<typeof createClient> = new Proxy({} as ReturnType<typeof createClient>, {
  get: (_t, p) => (getSupabase() as any)[p],
});

// Server-side Supabase client (uses service role key — bypasses RLS)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
      };
      child_profiles: {
        Row: {
          id: string;
          parent_id: string;
          name: string;
          age: number;
          tier: 1 | 2 | 3;
          avatar: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['child_profiles']['Row'], 'id' | 'created_at'>;
      };
      subscriptions: {
        Row: {
          id: string;
          parent_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          plan: 'monthly' | 'annual' | 'family';
          status: 'active' | 'canceled' | 'past_due';
          current_period_end: string;
          created_at: string;
        };
      };
      mission_progress: {
        Row: {
          id: string;
          child_id: string;
          mission_id: string;
          completed: boolean;
          attempts: number;
          badge: string | null;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['mission_progress']['Row'], 'id'>;
      };
    };
  };
};
