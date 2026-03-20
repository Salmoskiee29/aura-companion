import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TierKey } from '@/data/stripe-tiers';

export function useSubscriptionTier() {
  const { user } = useAuth();
  const [tier, setTier] = useState<TierKey>('free');
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!user) { setTier('free'); setLoading(false); return; }
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setTier(data?.subscribed ? (data.tier as TierKey) || 'basic' : 'free');
    } catch { /* keep current */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { check(); }, [check]);

  return { tier, isVip: tier === 'vip', loading, refresh: check };
}
