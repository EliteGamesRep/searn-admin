import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const WithdrawModal = ({ isOpen, onClose, onWithdraw }) => {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('onchain');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(''); 


  const handleWithdraw = async () => {
    if (!address) return;
    setIsSubmitting(true);
    try {
      await onWithdraw(address, network);
      onClose();
    } catch (err) {
      console.error('Withdraw error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Balance">
      <div className="space-y-4">
        <Input
          label="BTC Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="bc1q..."
        />
        <div>
          <label className="block text-sm text-gray-300 mb-1">Network</label>
          <select
            value={network}
            onChange={e => setNetwork(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
          >
            <option value="onchain">Bitcoin On-chain</option>
            <option value="lightning">Lightning</option>
          </select>
        </div>
        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <Button onClick={() => onWithdraw(address, network, amount)} disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Withdraw'}
        </Button>
      </div>
    </Modal>
  );
};

export default WithdrawModal;
