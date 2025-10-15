import React from 'react';
import { Building, Edit, Trash2, Globe, MessageCircle, Layers } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { Copy as CopyIcon } from 'lucide-react';

const MerchantList = ({ merchants, onEdit, onDelete }) => {
  const { toggleDisabled, toggleWithdrawals, user } = useAuth();
  const { addNotification } = useNotification();

  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isStoreRole = role === 'store_admin' || role === 'store_manager';
  const canDelete = role === 'super_admin';
  const canToggleStatus = role === 'super_admin' || role === 'super_manager';
  const canToggleWithdraw = ['super_admin', 'super_manager', 'store_admin', 'store_manager'].includes(role);
  const ownMerchantId = user?.merchantId ? String(user.merchantId) : null;

  const canToggleWithdrawFor = (merchant) => {
    if (!canToggleWithdraw) return false;
    if (isStoreRole) return ownMerchantId && ownMerchantId === String(merchant._id);
    return true;
  };

  const canEditMerchant = (merchant) => {
    if (isStoreRole) return ownMerchantId && ownMerchantId === String(merchant._id);
    return ['super_admin', 'super_manager'].includes(role);
  };

  const handleToggleWithdraw = async (merchant) => {
    try {
      await toggleWithdrawals(merchant._id, !merchant.withdrawalsEnabled);
    } catch (err) {
      console.error(err);
      addNotification('Failed to update withdrawals setting', 'error');
    }
  };

  return (
    <div className="grid gap-6">
      {merchants.map((merchant) => (
        <Card key={merchant._id} className="p-6 hover:scale-[1.02] transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white flex items-center">
                    {merchant.name}
                  </h3>
                  <p className="text-gray-400">{merchant.subdomain}</p>
                  <p
                    onClick={canToggleStatus ? () => toggleDisabled(merchant) : undefined}
                    className={`text-sm font-bold ${
                      canToggleStatus ? 'cursor-pointer' : 'cursor-default'
                    } ${merchant.disabled ? 'text-red-400' : 'text-green-400'}`}
                  >
                    Status: {merchant.disabled ? 'Disabled' : 'Active'}
                  </p>


                {Array.isArray(merchant.platforms) && merchant.platforms.length > 0 ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center text-xs text-gray-400 mr-1">
                      <Layers className="h-3.5 w-3.5 mr-1 text-teal-400" />
                      Platforms:
                    </span>
                    {merchant.platforms.map((p) => {
                      const id = typeof p === 'string' ? p : p?._id;
                      const name = typeof p === 'string' ? p : (p?.name ?? p);
                      return (
                        <span
                          key={id}
                          className="text-xs px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-200"
                          title={name}
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-500 italic">No platforms linked</p>
                )}

                  {/* end */}
                  


                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm mb-4">
                <div className="space-y-3">
                  {isSuperAdmin && (
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">🔑 API Key</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-mono text-gray-300 bg-gray-700 px-2 py-1 rounded">
                          {merchant.apiKey.length > 20
                            ? `${merchant.apiKey.slice(0, 20)}...`
                            : merchant.apiKey}
                        </p>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => {
                            navigator.clipboard.writeText(merchant.apiKey);
                            addNotification('API key copied', 'success');
                          }}
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}





{/* 
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">📢 Telegram Channel ID</p>
                    <p className="text-teal-400 flex items-center"><MessageCircle className="h-4 w-4 mr-1" />{merchant.telegramChannelId}</p>
                  </div> */}

                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">📢 Telegram Channel ID</p>
                    <p className="text-teal-400 flex items-start break-words whitespace-pre-wrap break-all max-w-full">
                      <MessageCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                      <span className="break-words">{merchant.telegramChannelId}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Total Transactions</p>
                    <p className="text-green-400 font-bold">{merchant.totalTransactions}</p>
                  </div>


                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">🌐 Subdomain</p>
                    <p className="text-gray-300 flex items-center"><Globe className="h-4 w-4 mr-1" />{merchant.subdomain}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">🆘 Support Link</p>
                    <p className="text-gray-300 truncate">{merchant.supportLink || 'Not configured'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">💰 Monthly Revenue</p>
                    <p className="text-green-400 font-bold">{formatCurrency(merchant.monthlyRevenue)}</p>
                  </div>

                  {/* <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Total withdraw</p>
                    <p className="text-green-400 font-bold">{formatCurrency(merchant.totalWithdraw)}</p>
                  </div> */}

                  {/* <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Withdrawals</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={merchant.withdrawalsEnabled ? 'success' : 'danger'}>
                        {merchant.withdrawalsEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      {canToggleWithdrawFor(merchant) && (
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => handleToggleWithdraw(merchant)}
                        >
                          {merchant.withdrawalsEnabled ? 'Disable' : 'Enable'}
                        </Button>
                      )}
                    </div>
                  </div> */}


                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">📅 Created</p>
                    <p className="text-gray-300">{formatDate(merchant.createdAt)}</p>
                  </div>

                  {/* <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <p className="text-gray-400 text-xs uppercase tracking-wide p-2">🖼️ Banner Image</p>
                    {merchant.bannerImage ? (
                      <img
                        src={merchant.bannerImage}
                        alt="Banner"
                        className="w-full h-auto block"
                      />
                    ) : (
                      <p className="text-gray-500 italic p-2">No banner uploaded</p>
                    )}
                  </div> */}





                </div>
              </div>
            </div>

            <div className="flex space-x-2 ml-6">
              {canEditMerchant(merchant) && onEdit && (
                <Button variant="secondary" size="small" onClick={() => onEdit(merchant)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canDelete && onDelete && (
                <Button variant="danger" size="small" onClick={() => onDelete(merchant._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MerchantList;
