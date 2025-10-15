import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Zap, Bitcoin, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const NETWORKS = [
  { id: 'lightning', label: 'Lightning', icon: Zap },
  { id: 'onchain', label: 'Bitcoin (On-chain)', icon: Bitcoin },
];

const MerchantWithdrawModal = ({
  isOpen,
  onClose,
  balances,
  onWithdrawPartial,
  onWithdrawAll,
  allowUsdMode = true,
}) => {
  const [network, setNetwork] = useState('lightning');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState(allowUsdMode ? 'usd' : 'sats');
  const [error, setError] = useState('');
  const [submittingPartial, setSubmittingPartial] = useState(false);
  const [submittingAll, setSubmittingAll] = useState(false);

  const usdAvailable = Number(balances?.usd ?? 0);
  const satsAvailable = Number(balances?.sats ?? 0);
  const reserveSats = 5000;
  const maxWithdrawableSats = Math.max(0, satsAvailable - reserveSats);
  const usdPerSat = satsAvailable > 0 ? (usdAvailable / satsAvailable) : 0;
  const reserveUsd = reserveSats * usdPerSat;
  const maxWithdrawableUsd = maxWithdrawableSats * usdPerSat;
  const supportsUsd = usdAvailable > 0;
  const supportsUsdMode = allowUsdMode && supportsUsd;

  const usdToSatsRate = useMemo(() => {
    if (!supportsUsdMode || !satsAvailable) return null;
    const rate = satsAvailable / usdAvailable;
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  }, [supportsUsdMode, satsAvailable, usdAvailable]);

  useEffect(() => {
    if (isOpen) {
      setNetwork('lightning');
      setAddress('');
      setAmount('');
      setMode(supportsUsdMode ? 'usd' : 'sats');
      setError('');
      setSubmittingPartial(false);
      setSubmittingAll(false);
    }
  }, [isOpen, supportsUsdMode]);

  const resetAndClose = () => {
    setAddress('');
    setAmount('');
    setError('');
    setSubmittingPartial(false);
    setSubmittingAll(false);
    onClose();
  };

  const normalizeWithdrawAddress = (value, method) => {
    if (!value) return '';
    let cleaned = value.trim();
    if (!cleaned) return '';

    if (method === 'onchain') {
      cleaned = cleaned.replace(/^bitcoin:/i, '');
      cleaned = cleaned.split('?')[0];
    }

    if (method === 'lightning') {
      cleaned = cleaned.replace(/^lightning:/i, '');
    }

    return cleaned.trim();
  };

  const validateAddress = () => {
    const sanitized = normalizeWithdrawAddress(address, network);
    if (!sanitized) {
      setError(network === 'lightning' ? 'Lightning invoice is required.' : 'Withdrawal address is required.');
      return null;
    }
    return sanitized;
  };

  const handlePartialSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const sanitizedAddress = validateAddress();
    if (!sanitizedAddress) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid withdrawal amount.');
      return;
    }

    let amountSats = numericAmount;
    if (mode === 'usd') {
      if (!usdToSatsRate) {
        setError('USD conversion unavailable. Switch to sats mode.');
        return;
      }
      if (numericAmount > usdAvailable) {
        setError('Amount exceeds available USD balance.');
        return;
      }
      amountSats = Math.round(numericAmount * usdToSatsRate);
    } else {
      if (numericAmount > maxWithdrawableSats) {
        setError(`Amount exceeds max withdrawable. Max: ${maxWithdrawableSats.toLocaleString()} sats (~${formatCurrency(Number(maxWithdrawableUsd.toFixed(2)))}), keeping ${reserveSats.toLocaleString()} sats (~${formatCurrency(Number(reserveUsd.toFixed(2)))}) reserve.`);
        return;
      }
      amountSats = Math.round(numericAmount);
    }

    if (!amountSats || amountSats <= 0) {
      setError('Calculated sats amount is invalid.');
      return;
    }

    try {
      setSubmittingPartial(true);
      const success = await onWithdrawPartial({
        amountSats,
        amount,
        network,
        address: sanitizedAddress,
      });
      if (success) resetAndClose();
    } catch (err) {
      setError(err?.message || 'Withdrawal failed.');
    } finally {
      setSubmittingPartial(false);
    }
  };

  const handleWithdrawAll = async () => {
    setError('');
    const sanitizedAddress = validateAddress();
    if (!sanitizedAddress) return;

    try {
      setSubmittingAll(true);
      const success = await onWithdrawAll({
        network,
        address: sanitizedAddress,
      });
      if (success) resetAndClose();
    } catch (err) {
      setError(err?.message || 'Withdraw all failed.');
    } finally {
      setSubmittingAll(false);
    }
  };

  const renderConversionHint = () => {
    if (mode !== 'usd' || !usdToSatsRate || !amount) return null;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return null;
    const sats = Math.round(numericAmount * usdToSatsRate).toLocaleString();
    return <p className="text-xs text-gray-400">≈ {sats} sats</p>;
  };

  const renderReserveHint = () => (
    <p className="text-xs text-gray-400">Max withdrawable: {maxWithdrawableSats.toLocaleString()} sats (~{formatCurrency(Number(maxWithdrawableUsd.toFixed(2)))}) — Reserve: {reserveSats.toLocaleString()} sats (~{formatCurrency(Number(reserveUsd.toFixed(2)))})</p>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Withdraw Balance"
      size="medium"
    >
      <div className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-1">
          <p className="text-sm text-gray-400">Available USD</p>
          <p className="text-lg text-white font-semibold">{formatCurrency(usdAvailable)}</p>
          <p className="text-xs text-gray-500">≈ {Math.round(satsAvailable).toLocaleString()} sats</p>
        </div>

        <form className="space-y-6" onSubmit={handlePartialSubmit}>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Select Network</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NETWORKS.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setNetwork(id)}
                  className={`w-full flex items-center justify-center gap-3 rounded-lg border-2 px-4 py-3 transition-all ${
                    network === id
                      ? 'border-teal-400 bg-teal-500/20 text-white'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-teal-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label={network === 'lightning' ? 'Lightning Invoice' : 'Bitcoin Address'}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={network === 'lightning' ? 'lnbc...' : 'bc1...'}
            required
          />

          <div className="flex items-center gap-3">
            {supportsUsdMode && (
              <button
                type="button"
                onClick={() => setMode('usd')}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border ${
                  mode === 'usd' ? 'border-teal-400 text-white bg-teal-500/20' : 'border-gray-600 text-gray-300'
                }`}
              >
                <DollarSign className="w-4 h-4" /> USD
              </button>
            )}
            {/* <button
              type="button"
              onClick={() => setMode('sats')}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border ${
                mode === 'sats' ? 'border-teal-400 text-white bg-teal-500/20' : 'border-gray-600 text-gray-300'
              }`}
            >
              ₿ SATS
            </button> */}
          </div>

          <Input
            label={mode === 'usd' ? 'Amount (USD)' : 'Amount (sats)'}
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={mode === 'usd' ? 'Enter USD amount' : 'Enter sats amount'}
          />

          {renderConversionHint()}
          {renderReserveHint()}

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={submittingPartial} disabled={submittingPartial}>
              Withdraw Amount
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleWithdrawAll}
              loading={submittingAll}
              disabled={submittingAll}
            >
              Withdraw All
            </Button>
            <Button type="button" variant="secondary" onClick={resetAndClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default MerchantWithdrawModal;
