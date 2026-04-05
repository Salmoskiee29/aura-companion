export const TIERS = {
  free: {
    name: 'Free Trial',
    price: '$0',
    period: '',
    diamonds: 10,
    daily_human_replies: 0,
  },
  basic: {
    name: 'Basic',
    price: '$9.99',
    period: '/mo',
    diamonds: 0,
    daily_human_replies: 15,
  },
  premium: {
    name: 'Premium',
    price: '$19.99',
    period: '/mo',
    diamonds: 50,
    daily_human_replies: 50,
  },
  vip: {
    name: 'VIP',
    price: '$29.99',
    period: '/mo',
    diamonds: 150,
    daily_human_replies: 999,
  },
} as const;

export type TierKey = keyof typeof TIERS;

export const DIAMOND_BUNDLES = [
  { diamonds: 100, price: '$4.99' },
  { diamonds: 500, price: '$19.99' },
  { diamonds: 1000, price: '$34.99' },
] as const;
