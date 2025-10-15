import React, { useEffect, useState } from 'react';
import { Zap, Bitcoin, Copy, RefreshCw } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import api from '../../utils/axios';

const NETWORKS = [
  { id: 'lightning', label: 'Lightning', icon: Zap },
  { id: 'onchain', label: 'Bitcoin (On-chain)', icon: Bitcoin }
];

const MerchantDepositModal = ({ isOpen, onClose }) => {
  const { addNotification } = useNotification();
  const [amount, setAmount] = useState('50');
  const [network, setNetwork] = useState('lightning');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setAmount('50');
      setNetwork('lightning');
      setError('');
      setLoading(false);
      setResult(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/merchants/deposit', {
        amount: Math.round(numericAmount * 100) / 100,
        network
      });
      setResult(data);
      addNotification('Deposit invoice generated.', 'success');
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to start deposit.';
      setError(message);
      addNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.address) return;
    try {
      await navigator.clipboard.writeText(result.address);
      addNotification('Payment details copied to clipboard.', 'success');
    } catch {
      addNotification('Failed to copy details. Please copy manually.', 'error');
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={result ? 'Complete Your Deposit' : 'Deposit Balance'}
      size="medium"
    >
      {!result ? (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Amount (USD)"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3">Select Network</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NETWORKS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          
            <p className="text-xs text-gray-400">
              A 1% processing fee applies to every deposit.
            </p>
          

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={loading} disabled={loading}>
              Generate Payment
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-400">Order ID</p>
            <p className="text-lg text-white font-semibold">{result.orderId}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-sm text-gray-400">Amount</p>
                <p className="text-white font-semibold">{formatCurrency(result.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Network</p>
                <p className="text-white font-semibold capitalize">{result.network}</p>
              </div>
              {result.expires_at && (
                <div>
                  <p className="text-sm text-gray-400">Expires</p>
                  <p className="text-white font-semibold">{formatDateTime(result.expires_at)}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">
              {result.network === 'lightning' ? 'Lightning Invoice' : 'BTC Address'}
            </p>
            <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-4">
              <pre className="whitespace-pre-wrap break-all text-sm text-teal-300">{result.address}</pre>
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => setResult(null)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> New Deposit
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MerchantDepositModal;
