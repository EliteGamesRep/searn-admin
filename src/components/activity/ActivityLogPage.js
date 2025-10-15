import React from 'react';
import { Clock, RefreshCw, Shield } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../utils/formatters';

const roleLabels = {
  super_admin: 'Super Admin',
  super_manager: 'Super Manager',
  store_admin: 'Store Admin',
  store_manager: 'Store Manager',
  store_cashier: 'Store Cashier',
};

const ActivityLogPage = () => {
  const { activityLogs, refreshActivityLogs, user } = useAuth();

  const canView = ['super_admin', 'super_manager', 'store_admin'].includes(user?.role);

  if (!canView) {
    return (
      <Card className="p-10 text-center bg-gray-800">
        <Shield className="w-12 h-12 mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400">You do not have permission to view activity logs.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Clock className="h-8 w-8 text-teal-400 mr-3" />
            Activity Logs
          </h1>
          <p className="text-gray-400 mt-2">
            Track key admin actions along with user, role, merchant, and IP metadata.
          </p>
        </div>
        <Button onClick={refreshActivityLogs} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">IP</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {activityLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No activity recorded yet.
                  </td>
                </tr>
              )}

              {activityLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-800/80">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.userEmail || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="info">
                      {roleLabels[log.userRole] || log.userRole || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.merchantId?.name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.ip || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-xs">
                    {log.details && Object.keys(log.details).length > 0
                      ? (
                        <pre className="text-xs bg-gray-800 text-gray-300 rounded-md p-2 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.createdAt ? formatDateTime(log.createdAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ActivityLogPage;
