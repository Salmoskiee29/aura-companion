export const TIERS = {
  free: {
    name: 'Free Trial',
    price: '$0',
    period: '',
    gems: 10,
    daily_human_replies: 0,
    product_id: null,
    price_id: null,
  },
  basic: {
    name: 'Basic',
    price: '$9.99',
    period: '/mo',
    gems: 0,
    daily_human_replies: 15,
    product_id: 'prod_Tz5DgQ4CQX5Ns1',
    price_id: 'price_1T17316Vjph7vzkpVl1AKSCF',
  },
  premium: {
    name: 'Premium',
    price: '$19.99',
    period: '/mo',
    gems: 50,
    daily_human_replies: 50,
    product_id: 'prod_Tz5DNqIeI5Uu0M',
    price_id: 'price_1T173J6Vjph7vzkpbAX27zGR',
  },
  vip: {
    name: 'VIP',
    price: '$29.99',
    period: '/mo',
    gems: 150,
    daily_human_replies: 999,
    product_id: 'prod_Tz5ELzQabf9Ta1',
    price_id: 'price_1T173e6Vjph7vzkp2hKzgfDC',
  },
} as const;

export type TierKey = keyof typeof TIERS;

export const GEM_BUNDLES = [
  { gems: 100, price: '$4.99', price_id: 'price_1T17456Vjph7vzkpiV54mGRv' },
  { gems: 500, price: '$19.99', price_id: 'price_1T174P6Vjph7vzkpLBPk5ws3' },
  { gems: 1000, price: '$34.99', price_id: 'price_1T174b6Vjph7vzkp1LyDiNJP' },
] as const;

// Map Stripe product IDs to tier keys
export const PRODUCT_TO_TIER: Record<string, TierKey> = {
  'prod_Tz5DgQ4CQX5Ns1': 'basic',
  'prod_Tz5DNqIeI5Uu0M': 'premium',
  'prod_Tz5ELzQabf9Ta1': 'vip',
};
