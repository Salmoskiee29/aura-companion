import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TierKey } from '@/data/stripe-tiers';

/**
 * Reads subscription tier from the local DB subscriptions table.
 * The edge function `check-subscription` syncs Stripe → DB on login & billing page.
 * This avoids hammering the edge function on every component mount.
 */
export function useSubscriptionTier() {
  // FREE MODE: Subscriptions disabled — everyone gets full access
  const [loading] = useState(false);
  const tier: TierKey = 'vip'; // Grant max access

  const check = useCallback(async () => {}, []);

  return { tier, isVip: true, loading, refresh: check };
}
