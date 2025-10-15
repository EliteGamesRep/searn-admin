import React, { useEffect, useState } from 'react';
import { Building, Shield, Globe, HelpCircle, Zap, Image, MessageCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { validateMerchant } from '../../utils/validators';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../contexts/AuthContext';
import MultiSelect from "../ui/MultiSelect"; // adjust path


import api from "../../utils/axios";


const MerchantForm = ({ merchant, onSave, onCancel }) => {
  const normalizePlatforms = (arr) =>
    Array.isArray(arr) ? arr.map(p => (typeof p === 'string' ? p : p?._id)).filter(Boolean) : [];


  const [formData, setFormData] = useState({
    name: merchant?.name || '',
    apiKey: merchant?.apiKey || '',
    telegramChannelId: merchant?.telegramChannelId || '',
    subdomain: merchant?.subdomain || '',
    bannerImage: merchant?.bannerImage || '',
    supportLink: merchant?.supportLink || '',
    adminCommissionPercent: merchant?.adminCommissionPercent ?? 1,
    withdrawalsEnabled: merchant?.withdrawalsEnabled ?? true,
    minimumDeposit: merchant?.minimumDeposit || '5',
    minimumWithdraw: merchant?.minimumWithdraw || '5',
    maximumWithdraw: merchant?.maximumWithdraw || '1000',
    platforms: normalizePlatforms(merchant?.platforms),
  });


  useEffect(() => {
    setFormData(s => ({
      ...s,
      name: merchant?.name || '',
      apiKey: merchant?.apiKey || '',
      telegramChannelId: merchant?.telegramChannelId || '',
      subdomain: merchant?.subdomain || '',
      bannerImage: merchant?.bannerImage || '',
      supportLink: merchant?.supportLink || '',
      adminCommissionPercent: merchant?.adminCommissionPercent ?? 1,
      withdrawalsEnabled: merchant?.withdrawalsEnabled ?? true,
      minimumDeposit: merchant?.minimumDeposit || '5',
      minimumWithdraw: merchant?.minimumWithdraw || '5',
      maximumWithdraw: merchant?.maximumWithdraw || '1000',
      platforms: normalizePlatforms(merchant?.platforms),
    }));
  }, [merchant]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingPlatforms(true);
      try {
        const { data } = await api.get("/platforms");
        if (mounted) setAllPlatforms(Array.isArray(data) ? data : []);
      } catch (e) {
        // optional: toast
      } finally {
        if (mounted) setLoadingPlatforms(false);
      }
    })();
    return () => { mounted = false; };
  }, []);



  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();
  const { addMerchant, updateMerchant, user } = useAuth();
  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isSuperManager = role === 'super_manager';
  const isStoreRole = role === 'store_admin' || role === 'store_manager';
  const canEditGeneral = isSuperAdmin || isSuperManager;
  const canEditPlatforms = canEditGeneral || isStoreRole;
  const canEditWithdrawals = canEditGeneral || isStoreRole;
  const showGeneralFields = canEditGeneral;
  const [allPlatforms, setAllPlatforms] = useState([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);


const handleSubmit = async (e) => {
  e?.preventDefault?.();
  console.log("handleSubmit",formData);
  const validationErrors = isStoreRole
    ? {}
    : validateMerchant(formData, { requireApiKey: isSuperAdmin });
  setErrors(validationErrors);

  console.log("formData",formData);
  if (Object.keys(validationErrors).length === 0) {
    setLoading(true);
    let payload;
    if (isStoreRole) {
      payload = {
        platforms: formData.platforms,
        withdrawalsEnabled: !!formData.withdrawalsEnabled,
      };
    } else {
      payload = { ...formData };
      if (!isSuperAdmin) {
        delete payload.apiKey;
      }
    }

    // try {
    //   const response = await axios.post('/merchants', formData);
    //   addNotification('🎮 Gaming hub created successfully!', 'success');
    //   onSave(response.data); // optional callback if needed
    // } catch (err) {
    //   console.error(err);
    //   addNotification('❌ Failed to create merchant', 'error');
    // }
    // setLoading(false);
    try {
      if (merchant?._id) {
        await updateMerchant(merchant._id, payload);
      } else {
        await addMerchant(payload);
      }
      // onSave(); // optional callback
    } catch (err) {
      console.error('Submission failed', err);
      const message = err?.response?.data?.error || '❌ Failed to create merchant';
      addNotification(message, 'error');
    } finally {
      setLoading(false);
    }



  }
};


  return (
    <div className="space-y-6">
      {showGeneralFields && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="🎮 Gaming Hub Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              icon={Building}
              placeholder="Searn Gaming Hub"
              disabled={!canEditGeneral}
            />

            {isSuperAdmin && (
              <Input
                label="🔑 API Key"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                error={errors.apiKey}
                icon={Shield}
                placeholder="api_key_123456789"
                disabled={!isSuperAdmin}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="📢 Telegram Channel ID"
              value={formData.telegramChannelId}
              onChange={(e) => setFormData({ ...formData, telegramChannelId: e.target.value })}
              error={errors.telegramChannelId}
              placeholder="-1001234567890"
              icon={MessageCircle}
              disabled={!canEditGeneral}
            />

            <Input
              label="🌐 Gaming Portal Subdomain"
              value={formData.subdomain}
              onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
              error={errors.subdomain}
              placeholder="searn.yourportal.com"
              icon={Globe}
              disabled={!canEditGeneral}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="🖼️ Banner Image URL"
              value={formData.bannerImage}
              onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
              error={errors.bannerImage}
              placeholder="https://cdn.site.com/banner.jpg"
              icon={Image}
              disabled={!canEditGeneral}
            />

            <Input
              label="🆘 Support Portal"
              type="url"
              value={formData.supportLink}
              onChange={(e) => setFormData({ ...formData, supportLink: e.target.value })}
              error={errors.supportLink}
              placeholder="https://support.elitegaming.com"
              icon={HelpCircle}
              disabled={!canEditGeneral}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="💸 Minimum Deposit"
              type="number"
              value={formData.minimumDeposit}
              onChange={(e) => setFormData({ ...formData, minimumDeposit: e.target.value })}
              error={errors.minimumDeposit}
              placeholder="5"
              disabled={!canEditGeneral}
            />

            <Input
              label="🔻 Minimum Withdraw"
              type="number"
              value={formData.minimumWithdraw}
              onChange={(e) => setFormData({ ...formData, minimumWithdraw: e.target.value })}
              error={errors.minimumWithdraw}
              placeholder="5"
              disabled={!canEditGeneral}
            />

            <Input
              label="🔺 Maximum Withdraw"
              type="number"
              value={formData.maximumWithdraw}
              onChange={(e) => setFormData({ ...formData, maximumWithdraw: e.target.value })}
              error={errors.maximumWithdraw}
              placeholder="1000"
              disabled={!canEditGeneral}
            />
          </div>
        </>
      )}

      {canEditWithdrawals && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <input
              id="withdrawalsEnabled"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={!!formData.withdrawalsEnabled}
              onChange={(e) => setFormData({ ...formData, withdrawalsEnabled: e.target.checked })}
              disabled={!canEditWithdrawals}
            />
            <label htmlFor="withdrawalsEnabled" className="text-sm font-medium text-gray-200">
              Enable Withdrawals
            </label>
          </div>
        </div>
      )}

      {canEditPlatforms && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">🧩 Platforms</label>
            <MultiSelect
              options={allPlatforms
                .filter(p => p?.enabled !== false)
                .map(p => ({ value: p._id, label: p.name }))}
              value={formData.platforms}
              onChange={(vals) => setFormData({ ...formData, platforms: vals })}
              placeholder="Select platforms…"
              maxTagCount={3}
              disabled={!canEditPlatforms}
            />
            <p className="text-xs text-gray-400">
              {loadingPlatforms ? "Loading platforms…" : "Start typing to filter, click to select. "}
            </p>
          </div>

          {showGeneralFields && (
            <Input
              label="💼 Commission (%)"
              type="number"
              min={0}
              max={20}
              step="0.1"
              value={formData.adminCommissionPercent}
              onChange={(e) => {
              const v = Number(e.target.value);
              const clamped = Number.isNaN(v) ? 0 : Math.max(0, Math.min(20, v));
              setFormData({ ...formData, adminCommissionPercent: clamped });
              }}
              error={errors.adminCommissionPercent}
              placeholder="0 – 20"
              disabled={!canEditGeneral}
            />
          )}
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-6">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} loading={loading}>
          <Zap className="h-4 w-4 mr-2" />
          {merchant ? 'Update' : 'Create'} Gaming Hub
        </Button>
      </div>
    </div>
  );
};

export default MerchantForm;
