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
  const { user } = useAuth();
  const [tier, setTier] = useState<TierKey>('free');
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!user) { setTier('free'); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      if (data?.status === 'active' && data.tier) {
        setTier(data.tier as TierKey);
      } else {
        setTier('free');
      }
    } catch {
      setTier('free');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { check(); }, [check]);

  return { tier, isVip: tier === 'vip', loading, refresh: check };
}
