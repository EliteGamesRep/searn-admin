import React, { useState , useEffect} from 'react';
import { Menu, Bell, ChevronDown, LogOut, Trophy } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ChangePasswordModal from '../modals/ChangePasswordModal';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { changeOwnPassword } = useAuth();



  const getRoleColor = (role) => {
    const colors = {
      super_admin: 'from-purple-500 to-pink-500',
      super_manager: 'from-fuchsia-500 to-purple-500',
      store_admin: 'from-teal-500 to-cyan-500',
      store_manager: 'from-sky-500 to-blue-500',
      store_cashier: 'from-yellow-500 to-orange-500'
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  const getRoleIcon = (role) => {
    const icons = {
      super_admin:'👑',
      super_manager:'🛡️',
      store_admin:'🏪',
      store_manager:'🎯',
      store_cashier:'💼'
    };
    return icons[role] || '👤';
  };

  return (
    <>
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4 shadow-xl">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                 {{
                  super_admin:'👑 Super Admin Portal',
                  super_manager:'🛡️ Super-Manager Dashboard',
                  store_admin:'🏪 Store Admin Dashboard',
                  store_manager:'🎯 Store Manager Dashboard',
                  store_cashier:'💼 Cashier Dashboard'
                }[user.role] || '👤 Dashboard'}
              </h1>
              <p className="text-xs text-gray-400">Searn Gaming Management</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* <button className="relative text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-teal-500 rounded-full animate-pulse"></span>
          </button> */}
          
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className={`w-10 h-10 bg-gradient-to-r ${getRoleColor(user.role)} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-white text-lg">
                  {getRoleIcon(user.role)}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-teal-400 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{user.email}</p>
                  <p className="text-xs text-teal-400 capitalize flex items-center">
                    {getRoleIcon(user.role)} {user.role.replace('_', ' ')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowChangePassword(true);
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <span className="mr-2">🔐</span>
                  Change Password
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSubmit={(oldPassword, newPassword) => changeOwnPassword(oldPassword, newPassword)}
      />
    </header>

    </>
  );
};

export default Header;