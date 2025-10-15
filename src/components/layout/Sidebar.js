// src/components/Sidebar.js
import React from 'react';
import {
  Home,
  CreditCard,
  Building,
  Users,
  BarChart3,
  Shield,
  X,
  Trophy,
  Layers,
  Activity
} from 'lucide-react';
import Card from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const role = user?.role || '';

    // base nav items for all
    const base = [
      { id: 'dashboard',    label: 'Dashboard',    icon: Home,       emoji: '🏠' },
      { id: 'transactions', label: 'Transactions', icon: CreditCard, emoji: '💳' },
    ];

    // base + gamerooms
    const withGamerooms = [
      ...base,
      { id: 'gamerooms', label: 'Gamerooms', icon: Trophy, emoji: '🎮' },
    ];

    switch (role) {
      case 'super_admin':
        return [
          ...base,
          { id: 'platforms',     label: 'Platforms',       icon: Layers,    emoji: '🧩' },
          { id: 'merchants',     label: 'Gaming Hubs',     icon: Building,  emoji: '🎰' },
          { id: 'users',         label: 'User Management', icon: Users,     emoji: '👥' },
          { id: 'reports',       label: 'Reports',         icon: BarChart3, emoji: '📊' },
          { id: 'blocked_ips',   label: 'Blocked IPs',     icon: Shield,    emoji: '🛑' },
        ];

      case 'super_manager':
        return [
          ...base,
          { id: 'platforms',     label: 'Platforms',       icon: Layers,    emoji: '🧩' },
          { id: 'merchants',     label: 'Gaming Hubs',     icon: Building,  emoji: '🎰' },
          { id: 'users',         label: 'User Management', icon: Users,     emoji: '👥' },
          { id: 'blocked_ips',   label: 'Blocked IPs',     icon: Shield,    emoji: '🛑' },
        ];

      case 'store_admin':
        return [
          ...base,
          // { id: 'activity_logs', label: 'Activity Logs',   icon: Activity, emoji: '📜' },
          { id: 'merchants',     label: 'Gaming Hubs',     icon: Building, emoji: '🎰' },
          { id: 'blocked_ips',   label: 'Blocked IPs',     icon: Shield,   emoji: '🛑' },
          { id: 'users',         label: 'User Management', icon: Users,    emoji: '👥' },
        ];

      case 'store_manager':
        return [
          ...base,
          { id: 'merchants',     label: 'Gaming Hubs',     icon: Building, emoji: '🎰' },
          { id: 'blocked_ips',   label: 'Blocked IPs',     icon: Shield,   emoji: '🛑' },
          { id: 'users',         label: 'User Management', icon: Users,    emoji: '👥' },
        ];

      case 'store_cashier':
        return [
          { id: 'dashboard',     label: 'Dashboard',     icon: Home,       emoji: '🏠' },
          // { id: 'new_withdraws', label: 'New Withdraws', icon: CreditCard, emoji: '🧾' },
          { id: 'transactions',  label: 'Transactions',  icon: CreditCard, emoji: '💳' },
        ];

      default:
        return base;
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-700
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12">
              <img src="/logo.png" alt="Searn Gaming Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-white">Admin Portal</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {getNavigationItems().map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
              }}
              className={`w-full flex items-center px-4 py-3 mb-2 text-left text-sm font-medium rounded-lg transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-lg mr-3">{item.emoji}</span>
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
              {activeTab === item.id && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer card */}
        <div className="absolute bottom-6 left-6 right-6">
          <Card className="p-4 bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-yellow-300" />
              <div>
                <p className="text-white font-semibold text-sm">🎮 Searn Status</p>
                <p className="text-purple-100 text-xs">Gaming Admin Pro</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
