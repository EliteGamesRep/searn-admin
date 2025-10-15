export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  CASHIER: 'cashier'
};

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal'
};

export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed'
};

export const MERCHANT_TIERS = {
  PREMIUM: 'premium',
  GOLD: 'gold',
  SILVER: 'silver',
  BRONZE: 'bronze'
};

export const GAME_TYPES = {
  SLOTS: 'Slots',
  POKER: 'Poker',
  BLACKJACK: 'Blackjack',
  ROULETTE: 'Roulette',
  DICE: 'Dice'
};

export const PAYMENT_METHODS = {
  BITCOIN: 'Bitcoin',
  LIGHTNING: 'Lightning',
  ETHEREUM: 'Ethereum'
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  MERCHANTS: '/merchants',
  TRANSACTIONS: '/transactions',
  USERS: '/users'
};

export const LOCAL_STORAGE_KEYS = {
  USER: 'admin_user',
  MERCHANTS: 'merchants',
  TRANSACTIONS: 'admin_transactions',
  USERS: 'admin_users'
};