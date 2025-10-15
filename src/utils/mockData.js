import { MERCHANT_TIERS, TRANSACTION_STATUS, TRANSACTION_TYPES, GAME_TYPES, PAYMENT_METHODS } from './constants';

export const MOCK_MERCHANTS = [
  {
    id: 1,
    name: "Elite Gaming Hub",
    apiKey: "api_elitegaming_123456",
    telegramChannel: "@elitegaming_official",
    subdomain: "elite.yourportal.com",
    announcement: "🎮 Welcome to Elite Gaming Hub! Premium Bitcoin gaming experience awaits.",
    supportLink: "https://support.elitegaming.com",
    status: "active",
    createdAt: "2024-01-15",
    lastActivity: "2024-07-05",
    tier: MERCHANT_TIERS.PREMIUM,
    monthlyRevenue: 125000
  },
  {
    id: 2,
    name: "Crypto Casino Pro",
    apiKey: "api_cryptocasino_789012",
    telegramChannel: "@cryptocasino_vip",
    subdomain: "crypto.yourportal.com",
    announcement: "💎 Crypto Casino Pro - Where winners are made! Instant payouts guaranteed.",
    supportLink: "https://help.cryptocasino.com",
    status: "active",
    createdAt: "2024-02-20",
    lastActivity: "2024-07-04",
    tier: MERCHANT_TIERS.GOLD,
    monthlyRevenue: 87500
  },
  {
    id: 3,
    name: "Bitcoin Slots Palace",
    apiKey: "api_btcslots_345678",
    telegramChannel: "@btcslots_palace",
    subdomain: "slots.yourportal.com",
    announcement: "🎰 Bitcoin Slots Palace - Spin to win with the best odds in crypto gaming!",
    supportLink: "https://support.btcslots.com",
    status: "active",
    createdAt: "2024-03-10",
    lastActivity: "2024-07-03",
    tier: MERCHANT_TIERS.SILVER,
    monthlyRevenue: 45000
  }
];

export const MOCK_TRANSACTIONS = [
  { 
    id: 1, 
    merchantId: 1, 
    type: TRANSACTION_TYPES.DEPOSIT, 
    amount: 2500, 
    date: "2024-07-05T10:30:00", 
    status: TRANSACTION_STATUS.COMPLETED, 
    playerEmail: "highroller@crypto.com",
    paymentMethod: PAYMENT_METHODS.BITCOIN,
    transactionId: "TXN001",
    gameType: GAME_TYPES.SLOTS
  },
  { 
    id: 2, 
    merchantId: 1, 
    type: TRANSACTION_TYPES.WITHDRAWAL, 
    amount: 1200, 
    date: "2024-07-05T09:15:00", 
    status: TRANSACTION_STATUS.PENDING, 
    playerEmail: "winner@elite.com",
    paymentMethod: PAYMENT_METHODS.LIGHTNING,
    transactionId: "TXN002",
    gameType: GAME_TYPES.POKER
  },
  { 
    id: 3, 
    merchantId: 2, 
    type: TRANSACTION_TYPES.DEPOSIT, 
    amount: 5000, 
    date: "2024-07-04T16:45:00", 
    status: TRANSACTION_STATUS.COMPLETED, 
    playerEmail: "vip@crypto.com",
    paymentMethod: PAYMENT_METHODS.BITCOIN,
    transactionId: "TXN003",
    gameType: GAME_TYPES.BLACKJACK
  },
  { 
    id: 4, 
    merchantId: 2, 
    type: TRANSACTION_TYPES.WITHDRAWAL, 
    amount: 3500, 
    date: "2024-07-04T14:20:00", 
    status: TRANSACTION_STATUS.COMPLETED, 
    playerEmail: "champion@casino.com",
    paymentMethod: PAYMENT_METHODS.BITCOIN,
    transactionId: "TXN004",
    gameType: GAME_TYPES.ROULETTE
  },
  { 
    id: 5, 
    merchantId: 3, 
    type: TRANSACTION_TYPES.DEPOSIT, 
    amount: 750, 
    date: "2024-07-03T11:30:00", 
    status: TRANSACTION_STATUS.COMPLETED, 
    playerEmail: "slots@player.com",
    paymentMethod: PAYMENT_METHODS.LIGHTNING,
    transactionId: "TXN005",
    gameType: GAME_TYPES.SLOTS
  },
];

export const MOCK_USERS = [
  { id: 1, email: "admin@elitegaming.com", password: "admin123", role: "super_admin", merchantId: null, status: "active" },
  { id: 2, email: "manager@elitegaming.com", password: "manager123", role: "manager", merchantId: 1, status: "active" },
  { id: 3, email: "cashier@elitegaming.com", password: "cashier123", role: "cashier", merchantId: 1, status: "active" },
  { id: 4, email: "manager@cryptocasino.com", password: "manager123", role: "manager", merchantId: 2, status: "active" },
  { id: 5, email: "support@btcslots.com", password: "support123", role: "cashier", merchantId: 3, status: "active" },
];