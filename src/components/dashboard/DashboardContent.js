import React from 'react';
import { Building, Plus, Activity } from 'lucide-react';
import DashboardStats from './DashboardStats';
import MerchantList from '../merchants/MerchantList';
import UserManagement from '../users/UserManagement';
import MerchantForm from '../merchants/MerchantForm';
import UserForm from '../users/UserForm';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import BlockedIpList from '../blocked/BlockedIpList';
import ReportsPage from '../reports/ReportsPage';
import NewWithdrawRequests from '../withdraws/NewWithdrawRequests';
import PlatformList from '../platforms/PlatformList';
import TransactionsPage from "../transactions/TransactionsPage";
import ActivityLogPage from '../activity/ActivityLogPage';
const DashboardContent = ({ 
  activeTab, 
  setActiveTab, 
  showMerchantForm, 
  setShowMerchantForm,
  showUserForm,
  setShowUserForm,
  editingMerchant,
  setEditingMerchant,
  userMerchant
}) => {
  const { 
    user, 
    transactions, 
    addMerchant, 
    updateMerchant, 
    deleteMerchant, 
    addUser, 
    allMerchants
  } = useAuth();

  const role = user?.role;
  const isSuper = ['super_admin', 'super_manager'].includes(role);

  const canManagePlatforms = isSuper;

  const handleSaveMerchant = (merchantData) => {
    if (editingMerchant) {
      updateMerchant(editingMerchant._id, merchantData);
    } else {
      addMerchant(merchantData);
    }
    setShowMerchantForm(false);
    setEditingMerchant(null);
  };

  const handleEditMerchant = (merchant) => {
    setEditingMerchant(merchant);
    setShowMerchantForm(true);
  };

  const handleSaveUser = (userData) => {
    addUser(userData);
    setShowUserForm(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">
                {{
                  super_admin: '👑 Super Admin Dashboard',
                  super_manager: '🛡️ Super Manager Dashboard',
                  store_admin: '🏪 Store Admin Dashboard',
                  store_manager: '🎯 Store Manager Dashboard',
                  store_cashier: '💼 Cashier Dashboard',
                }[role] || '💼 Admin Dashboard'}
              </h1>
              <p className="text-gray-400 text-lg">
                Welcome back, {user.email}
                {userMerchant && ` • Managing ${userMerchant.name}`}
              </p>
            </div>
            
            <DashboardStats />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {transactions?.length > 0 &&
                <Card className="p-6">
                  
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Activity className="h-6 w-6 text-teal-400 mr-2" />
                    🎮 Recent Gaming Activity
                  </h3>
                  
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map(transaction => (
                      <div key={transaction.id} className="flex justify-between items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${transaction.type === 'deposit' ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                          <div>
                            <p className="text-white font-medium">
                              {transaction.merchantId?.name} - {transaction.type === 'deposit' ? 'Deposit' : 'withdraw'}
                            </p>
                            <p className="text-sm text-gray-400">{transaction.gameId}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.type === 'deposit' ? 'text-green-400' : 'text-orange-400'}`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              }
              {isSuper && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Building className="h-6 w-6 text-purple-400 mr-2" />
                    🎰 Gaming Hubs Overview
                  </h3>
                  <div className="space-y-4">
                    {allMerchants.slice(0, 5).map(merchant => (
                      <div key={merchant.id} className="flex justify-between items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="text-white font-medium">{merchant.name}</p>
                            </div>
                            <p className="text-sm text-gray-400">{merchant.subdomain}</p>
                            <p className="text-xs text-gray-500">Revenue: {formatCurrency(merchant.monthlyRevenue)}/month</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {/* <Badge variant="success">Online</Badge> */}
                          <p className="text-xs text-gray-400 mt-1">
                            {merchant.totalTransactions} transactions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        );

      case 'transactions':
        return <TransactionsPage isSuper={isSuper} />;

      case 'activity_logs':
        return <ActivityLogPage />;

      case 'merchants': {
        if (role === 'store_cashier') {
          return (
            <div className="p-6 rounded-xl bg-gray-800 text-gray-300">
              You don’t have access to Gaming Hubs.
            </div>
          );
        }

        const canAddMerchant = role === 'super_admin';
        const canEditMerchant = ['super_admin', 'super_manager', 'store_admin', 'store_manager'].includes(role);
        const canDeleteMerchant = role === 'super_admin';

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <Building className="h-8 w-8 text-purple-400 mr-3" />
                  🎰 Gaming Hubs
                </h1>
                <p className="text-gray-400 mt-2">
                  {isSuper ? 'Manage all gaming hub partners' : 'View your gaming hub details'}
                </p>
              </div>
              {canAddMerchant && (
                <Button
                  onClick={() => setShowMerchantForm(true)}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gaming Hub
                </Button>
              )}
            </div>

            <MerchantList
              merchants={allMerchants}
              onEdit={canEditMerchant ? handleEditMerchant : undefined}
              onDelete={canDeleteMerchant ? deleteMerchant : undefined}
            />
          </div>
        );
      }

      case 'users':
        if (role === 'store_cashier') {
          return (
            <div className="p-6 rounded-xl bg-gray-800 text-gray-300">
              You don’t have access to User Management.
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">👥 User Management</h1>
            <UserManagement />
          </div>
        );


      case 'blocked_ips':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">🚫 Blocked IPs</h1>
            <BlockedIpList />
          </div>
        );

      case 'reports':
        if (role !== 'super_admin') {
          return (
            <div className="p-6 rounded-xl bg-gray-800 text-red-400">
              403 • Reports are available to Super Admin only.
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">📊 Reports</h1>
            <ReportsPage />
          </div>
        );

      // case 'new_withdraws':
      //   return (
      //     <div className="space-y-6">
      //       <h1 className="text-3xl font-bold text-white">💸 New Withdraw Requests</h1>
      //       <NewWithdrawRequests />
      //     </div>
      //   );
      case 'platforms':
        return canManagePlatforms ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">🧩 Platforms</h1>
            <PlatformList />
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-gray-800 text-red-400">
            403 • You don’t have permission to view Platforms.
          </div>
        );

      
        default:
        return <div className="text-white">Tab not found</div>;
    }
  };

  return (
    <>
      {renderContent()}
      
      {/* Gaming-themed Modals */}
      <Modal
        isOpen={showMerchantForm}
        onClose={() => {
          setShowMerchantForm(false);
          setEditingMerchant(null);
        }}
        title={editingMerchant ? '✏️ Edit Gaming Hub' : '🎮 Create New Gaming Hub'}
        size="large"
      >
        <MerchantForm
          merchant={editingMerchant}
          onSave={handleSaveMerchant}
          onCancel={() => {
            setShowMerchantForm(false);
            setEditingMerchant(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        title="👤 Add New User"
      >
        <UserForm
          onSave={handleSaveUser}
          onCancel={() => setShowUserForm(false)}
        />
      </Modal>
    </>
  );
};

export default DashboardContent;
