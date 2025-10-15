import React, { useEffect, useMemo, useState } from 'react';
import { Ban, Plus, Edit, Trash2, Globe2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useNotification } from '../../hooks/useNotification';
import api from '../../utils/axios';
import BlockIpModal from './BlockIpModal';
import { useAuth } from '../../hooks/useAuth';

const BlockedIpList = () => {
  const { addNotification } = useNotification();
  const { user, getUserMerchant } = useAuth();
  const role = user?.role;
  const isStoreRole = role === 'store_admin' || role === 'store_manager';
  const ownMerchant = getUserMerchant?.();
  const ownMerchantId = ownMerchant?._id
    ? String(ownMerchant._id)
    : (user?.merchantId ? String(user.merchantId) : null);

  const rowIncludesOwnMerchant = (row) => {
    if (!ownMerchantId) return false;
    const ids = Array.isArray(row?.merchantIds)
      ? row.merchantIds.map((m) => (typeof m === 'string' ? m : m?._id)).filter(Boolean).map(String)
      : [];
    return ids.includes(String(ownMerchantId));
  };

  const canManageRow = (row) => {
    if (!row) return false;
    if (!isStoreRole) return true;
    if (row.blockedForAll) return false;
    return rowIncludesOwnMerchant(row);
  };

  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // full row or null

  const load = async () => {
    try {
      setLoading(true);
      // Expect: [{ _id, ip, blockedForAll, merchantIds: [{_id,name,subdomain}], createdAt }]
      const { data } = await api.get('/blocked-ips');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      addNotification('Failed to load blocked IPs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(r =>
      r.ip?.toLowerCase().includes(needle) ||
      (r.merchantIds || [])
        .some(m => m?.name?.toLowerCase().includes(needle) || m?.subdomain?.toLowerCase().includes(needle))
    );
  }, [items, q]);

  const onUnblock = async (id) => {
    if (!window.confirm('Unblock this IP?')) return;
    try {
      await api.delete(`/blocked-ips/${id}`);
      addNotification('IP unblocked', 'success');
      load();
    } catch (e) {
      addNotification('Failed to unblock IP', 'error');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setShowModal(true);
  };

  return (
    <div className="p-4 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Ban className="h-5 w-5" />
          Blocked IPs
        </h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search IP / Hub / Subdomain"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <Button onClick={openCreate} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Block New IP
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-300 uppercase">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs text-gray-300 uppercase">IP</th>
              <th className="px-6 py-3 text-left text-xs text-gray-300 uppercase">Applied To</th>
              <th className="px-6 py-3 text-left text-xs text-gray-300 uppercase">Blocked By</th>
              <th className="px-6 py-3 text-left text-xs text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading && (
              <tr><td colSpan={4} className="px-6 py-4 text-gray-400">Loading...</td></tr>
            )}

            {!loading && filtered.map((row) => (
              <tr key={row._id} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-3 text-gray-200">
                  {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                </td>

                <td className="px-6 py-3">
                  {canManageRow(row) ? (
                    <button
                      onClick={() => openEdit(row)}
                      className="text-teal-300 hover:text-teal-200 underline underline-offset-2"
                      title="Edit block scope"
                    >
                      {row.ip}
                    </button>
                  ) : (
                    <span className="text-gray-200">{row.ip}</span>
                  )}
                </td>

                <td className="px-6 py-3 text-gray-200">
                  {row.blockedForAll ? (
                    isStoreRole ? (
                      'Complete platform'
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Globe2 className="h-4 w-4" /> ALL hubs
                      </span>
                    )
                  ) : (
                    isStoreRole
                      ? 'Some hubs'
                      : (row.merchantIds?.length
                          ? row.merchantIds.map(m => `${m.name}${m.subdomain ? ` (${m.subdomain})` : ''}`).join(', ')
                          : '—')
                  )}
                </td>
                <td className="px-6 py-3 text-gray-200">
                  {row.createdBy
                    ? `${row.createdBy.email || 'Unknown'} (${row.createdBy.role?.replaceAll('_',' ') || '—'})`
                    : '—'}
                </td>


                <td className="px-6 py-3 text-sm font-medium">
                  <div className="flex gap-2">
                    {canManageRow(row) && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => openEdit(row)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {canManageRow(row) && (
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => onUnblock(row._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {!loading && filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-gray-400">No blocked IPs</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <BlockIpModal
              editing={editing}         // row or null
              onClose={() => { setShowModal(false); setEditing(null); }}
              onSaved={() => { setShowModal(false); setEditing(null); load(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockedIpList;
