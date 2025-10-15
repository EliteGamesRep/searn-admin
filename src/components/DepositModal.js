import React from 'react';
import { Zap } from 'lucide-react';

const DepositModal = ({ 
  gameId, 
  setGameId, 
  amount, 
  setAmount, 
  selectedNetwork, 
  setSelectedNetwork, 
  onGeneratePayment 
}) => {
  return (
    <>
      <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-t-2xl p-6">
        <div className="flex items-center justify-center mb-2">
          <Zap className="text-yellow-400 mr-2" size={24} />
          <h3 className="text-xl font-bold text-white">SEARN GAMING</h3>
        </div>
      </div>
      <div className="bg-white rounded-b-2xl p-6 text-black">
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Enter Game ID</label>
          <input
            type="text"
            placeholder="Enter your game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Enter Amount</label>
          <input
            type="number"
            value={amount}
            min="1"
            step="1"
            onChange={(e) => {
              const val = Math.max(1, Math.floor(Number(e.target.value) || 0));
              setAmount(val);
            }}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />

          <p className="text-gray-500 mt-2">{amount} USD</p>
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-2">Select network</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedNetwork('lightning')}
              className={`p-4 rounded-lg border-2 flex items-center justify-center transition-all ${
                selectedNetwork === 'lightning'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <Zap size={20} className="mr-2" />
              Lightning
            </button>
            <button
              onClick={() => setSelectedNetwork('onchain')}
              className={`p-4 rounded-lg border-2 flex items-center justify-center transition-all ${
                selectedNetwork === 'onchain'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              ₿ Bitcoin
            </button>
          </div>
        </div>

        <button
          onClick={onGeneratePayment}
          className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
        >
          Generate Payment
        </button>
      </div>
    </>
  );
};

export default DepositModal;
