import { useState, useCallback } from 'react';
import type { TierKey } from '@/data/stripe-tiers';

/**
 * Reads subscription tier from the local DB subscriptions table.
 * Currently in FREE MODE — everyone gets full access.
 */
export function useSubscriptionTier() {
  const [loading] = useState(false);
  const tier: TierKey = 'vip'; // Grant max access

  const check = useCallback(async () => {}, []);

  return { tier, isVip: true, loading, refresh: check };
}
