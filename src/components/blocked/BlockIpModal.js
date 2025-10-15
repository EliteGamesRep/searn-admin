import React, { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/axios';

const BlockIpModal = ({ editing, ip: quickIp, open, onClose, onSaved }) => {
  const { addNotification } = useNotification();
  const { user, getUserMerchant } = useAuth();
  const isEdit = !!editing?._id;

  const role = user?.role;
  const isSuper = role === 'super_admin' || role === 'super_manager';
  const myMerchant = getUserMerchant?.();

  const merchantIdForScope = myMerchant?._id || user?.merchantId || null;

  const initialMerchantIds = isSuper
    ? (editing?.merchantIds || []).map(m => m?._id || m)
    : merchantIdForScope
      ? [merchantIdForScope]
      : [];

  const [form, setForm] = useState({
    ip: editing?.ip || quickIp || '',
    blockedForAll: isSuper ? editing?.blockedForAll ?? true : false,
    merchantIds: initialMerchantIds,
  });

  const [allMerchants, setAllMerchants] = useState(() => (
    isSuper
      ? []
      : merchantIdForScope
        ? [{ _id: merchantIdForScope, name: myMerchant?.name || 'Your Hub', subdomain: myMerchant?.subdomain }]
        : []
  ));
  const [saving, setSaving] = useState(false);
  const [loadingMerchants, setLoadingMerchants] = useState(isSuper);


  useEffect(() => {
    if (open) {
      setForm(prev => ({
        ...prev,
        ip: editing?.ip || quickIp || '',
        blockedForAll: isSuper ? (editing?.blockedForAll ?? true) : false,
        merchantIds: isSuper
          ? (editing?.merchantIds || []).map(m => m?._id || m)
          : (merchantIdForScope ? [merchantIdForScope] : []),
      }));
    }
  }, [isEdit, open, quickIp, editing, isSuper, merchantIdForScope]);

  // Load hubs list
  useEffect(() => {
    if (!isSuper) {
      setAllMerchants(merchantIdForScope
        ? [{ _id: merchantIdForScope, name: myMerchant?.name || 'Your Hub', subdomain: myMerchant?.subdomain }]
        : []);
      setLoadingMerchants(false);
      return;
    }

    (async () => {
      try {
        setLoadingMerchants(true);
        const { data } = await api.get('/merchants?select=_id,name,subdomain');
        setAllMerchants(Array.isArray(data) ? data : []);
      } catch {
        addNotification('Failed to load hubs', 'error');
      } finally {
        setLoadingMerchants(false);
      }
    })();
    // eslint-disable-next-line
  }, [isSuper, merchantIdForScope, myMerchant]);

  const canSave = useMemo(() => {
    if (!form.ip.trim()) return false;
    if (isSuper && form.blockedForAll) return true;
    return form.merchantIds.length > 0;
  }, [form, isSuper]);

  const toggleMerchant = (id) => {
    if (!isSuper) return;
    setForm(prev => ({
      ...prev,
      merchantIds: prev.merchantIds.includes(id)
        ? prev.merchantIds.filter(x => x !== id)
        : [...prev.merchantIds, id]
    }));
  };

  const handleSubmit = async () => {
    if (!canSave || saving) return;

    try {
      setSaving(true);
      const payload = {
        ip: form.ip.trim(),
        blockedForAll: isSuper ? !!form.blockedForAll : false,
        merchantIds: isSuper
          ? (form.blockedForAll ? [] : form.merchantIds)
          : (merchantIdForScope ? [merchantIdForScope] : []),
      };

      if (isEdit) {
        await api.put(`/blocked-ips/${editing._id}`, payload);
        addNotification('Blocked IP updated', 'success');
      } else {
        await api.post('/blocked-ips', payload);
        addNotification('IP blocked successfully', 'success');
      }

      onSaved?.();
    } catch (e) {
      addNotification(e?.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* <h3 className="text-lg font-semibold">{isEdit ? 'Edit Blocked IP' : 'Block New IP'}</h3> */}
      <h3 className="text-lg font-semibold">
        {isEdit ? `Edit Block: ${form.ip}` : 'Block New IP'}
      </h3>
      {/* IP */}
      <Input
        label="🖥️ IP Address"
        value={form.ip}
        onChange={(e) => setForm(prev => ({ ...prev, ip: e.target.value }))}
        placeholder="e.g., 203.0.113.42"
        disabled={isEdit} // IP immutable on edit as per spec
      />

      {/* Scope */}
      <div className="space-y-2">
        {/* <label className="block text-sm font-medium text-gray-300">Scope</label> */}
        {isSuper && (
          <>
            <div className="flex items-center gap-2">
              <input
                id="apply-all"
                type="checkbox"
                checked={form.blockedForAll}
                onChange={(e) => setForm(prev => ({ ...prev, blockedForAll: e.target.checked }))}
              />
              <label htmlFor="apply-all" className="text-gray-200">Apply to ALL Gaming Hubs</label>
            </div>

            {!form.blockedForAll && (
              <div>
                <div className="text-xs text-gray-400 mb-2">Select one or more Hubs</div>
                <div className="max-h-48 overflow-auto bg-gray-800 rounded p-2">
                  {loadingMerchants && (
                    <div className="text-gray-400 text-sm p-2">Loading hubs…</div>
                  )}
                  {!loadingMerchants && allMerchants.map(m => (
                    <label key={m._id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={form.merchantIds.includes(m._id)}
                        onChange={() => toggleMerchant(m._id)}
                      />
                      <span className="text-gray-200">
                        {m.name}{m.subdomain ? ` (${m.subdomain})` : ''}
                      </span>
                    </label>
                  ))}
                  {!loadingMerchants && allMerchants.length === 0 && (
                    <div className="text-gray-400 text-sm p-2">No hubs found.</div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Tip: If ALL is not selected, at least one hub is required.
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={saving} disabled={!canSave}>
          {isEdit ? 'Update' : 'Block'}
        </Button>
      </div>
    </div>
  );
};

export default BlockIpModal;
