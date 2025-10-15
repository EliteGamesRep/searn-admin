import React from 'react';
import { DollarSign, Clock, Zap } from 'lucide-react';

const RedeemModal = ({ 
  gameId, 
  setGameId, 
  walletAddress, 
  setWalletAddress, 
  redeemAmount, 
  setRedeemAmount, 
  selectedNetwork,
  setSelectedNetwork,
  onSubmitRedemption 
}) => {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 text-white">
      <div className="flex items-center mb-6">
        <DollarSign className="text-yellow-400 mr-3" size={24} />
        <h3 className="text-2xl font-bold text-gaming-green">Redeem Winnings</h3>
      </div>

      <div className="bg-green-900 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <DollarSign className="text-yellow-400 mr-2 mt-1 flex-shrink-0" size={16} />
          <div className="text-sm">
            <span className="font-semibold">Redemption Info:</span> You can redeem your winnings
            instantly via Bitcoin Lightning or BTC On-Chain. One redemption per 24
            hours. Minimum redeem: $50.
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-2">Game ID</label>
          <input
            type="text"
            placeholder="Enter your game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full p-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gaming-green transition-all"
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Select Network</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedNetwork('lightning')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border transition-all ${
                selectedNetwork === 'lightning'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-gray-500 text-gray-300 hover:border-teal-400'
              }`}
            >
              <Zap className="w-5 h-5 mr-2" />
              Lightning
            </button>

            <button
              onClick={() => setSelectedNetwork('onchain')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border transition-all ${
                selectedNetwork === 'onchain'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-gray-500 text-gray-300 hover:border-teal-400'
              }`}
            >
              ₿ Bitcoin
            </button>

          </div>
        </div>


        <div>
          <label className="block text-white font-semibold mb-2">Wallet Address</label>
          <input
            type="text"
            placeholder="Lightning or BTC address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full p-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gaming-green transition-all"
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Redeem Amount (USD)</label>
          <input
            type="number"
            placeholder="Minimum 5 USD"
            value={redeemAmount}
            min={5}
            max={500}
            onChange={(e) => setRedeemAmount(e.target.value)}
            className="w-full p-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gaming-green transition-all"
          />
        </div>

        <button
          onClick={onSubmitRedemption}
          className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
        >
          Submit Redemption Request
        </button>

        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center">
            <Clock className="text-yellow-400 mr-2" size={20} />
            <span className="text-yellow-400 font-semibold">Processing:</span>
            <span className="text-white ml-2">Standard processing takes 2–24 hours.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemModal;
