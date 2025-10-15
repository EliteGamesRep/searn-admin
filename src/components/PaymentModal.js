import React from 'react';
import { Zap, Copy, Clock } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';


const PaymentModal = ({ paymentAddress, timeLeft, formatTime, paymentStatus, orderId }) => {
  const handleCopy = async () => {
    const success = await copyToClipboard(paymentAddress);
    if (success) {
      console.log('Address copied to clipboard');
    }
  };

  return (
    <>
      <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-t-2xl p-4 sm:p-6">
        <div className="flex items-center justify-center mb-2">
          <Zap className="text-yellow-400 mr-2" size={24} />
          <h3 className="text-lg sm:text-xl font-bold text-white">SEARN GAMING</h3>
        </div>
      </div>

      <div className="bg-white rounded-b-2xl p-4 sm:p-6 text-black">
        <div className="flex flex-col items-center text-center space-y-4">

          {paymentStatus === 'pending' && (
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Clock className="text-red-500 mr-2" size={20} />
              <span>Time Left:</span>
              <span className="text-red-500 font-bold ml-2">{formatTime()}</span>
            </div>
          )}

          {paymentStatus === 'paid' && (
            <div className="text-green-600 font-semibold text-sm">
              🎉 Payment received! You can now play.
            </div>
          )}

          {timeLeft === 0 && paymentStatus !== 'paid' && (
            <div className="text-red-600 font-semibold text-sm">
              Payment window expired. Please try again.
            </div>
          )}

          <div className="bg-gray-100 px-4 py-3 rounded-lg w-full max-w-md break-all text-sm font-mono border border-gray-300">
            {paymentAddress}
          </div>

            {orderId && (
              <div className="text-xs text-gray-600">
                Order No: <span className="font-mono">{orderId}</span>
              </div>
            )}

          <button
            type="button"
            onClick={handleCopy}
            className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center relative hover:shadow-lg transition-all"
          >
            <Copy className="absolute left-4 w-5 h-5 text-[#22d3ee]" />
            <span className="text-base">Copy</span>
          </button>

        </div>
      </div>
    </>
  );
};

export default PaymentModal;
