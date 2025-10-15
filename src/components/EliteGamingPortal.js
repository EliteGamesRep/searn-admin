import React, { useState ,useEffect } from 'react';
import { Zap, DollarSign } from 'lucide-react';
import Modal from './Modal';
import DepositModal from './DepositModal';
import PaymentModal from './PaymentModal';
import RedeemModal from './RedeemModal';
import { useTimer } from '../hooks/useTimer';
import { generateMockAddress } from '../utils/helpers';
import { toast } from 'react-toastify'
import axios from 'axios';

const EliteGamingPortal = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [gameId, setGameId] = useState('');
  const [amount, setAmount] = useState('5');
  const [selectedNetwork, setSelectedNetwork] = useState('lightning');
  const [walletAddress, setWalletAddress] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [paymentAddress, setPaymentAddress] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); 

  const { timeLeft, reset, formatTime } = useTimer(0, activeModal === 'payment');


useEffect(() => {
  if (activeModal === 'payment' && paymentId) {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/status/${paymentId}`);
        const data = res.data;

        console.log('Polled status:', data.status);
        if (data.status === 'paid') {
          setPaymentStatus('paid'); // ✅ update state
          clearInterval(interval);  // stop polling (optional)
        }
      } catch (error) {
        console.error('Error polling payment status:', error.response?.data || error.message);
      }
    }, 5000);

    return () => clearInterval(interval);
  }
}, [activeModal, paymentId]);




  const generatePayment = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/create-payment`, {
        gameId,
        amount: parseFloat(amount),
        network: selectedNetwork // "lightning" or "bitcoin"
      });

      // ✅ Extract the Lightning invoice safely
      // const paymentRequest = response.data?.payment_method_options?.lightning?.payment_request;
      let paymentRequest = '';

      console.log("response.data>>>>>",response.data);
      if (selectedNetwork === 'onchain') {
        paymentRequest = response.data.payment_method_options?.on_chain?.address;
      } else if (selectedNetwork === 'lightning') {
        paymentRequest = response.data?.payment_method_options?.lightning?.payment_request;
      }
      
      
      const paymentId = response.data?.id;
      
      if (!paymentRequest || !paymentId) {
        throw new Error('Missing payment request or ID');
      }

      setPaymentAddress(paymentRequest); // Or setPaymentInvoice, more clear
      setPaymentId(paymentId)
      setPaymentStatus('pending');
      const expiresAt = response.data?.expires_at;
      const ttlSeconds = Math.max(Math.floor((expiresAt - Date.now()) / 1000), 0);
      reset(ttlSeconds); // ✅ Use real expiry




      setActiveModal('payment');
    } catch (error) {
      console.error('Error generating payment:', error.response?.data || error.message);
      // alert('Failed to generate payment. Please try again.');
      toast.error('Failed to generate payment. Please try again.');

    }
  };





const submitRedemption = async () => {
  try {
    const usdAmount = parseFloat(redeemAmount);
    if (usdAmount < 5 || usdAmount > 500) {
      toast.error('Amount must be $5–$500.');
      return;
    }
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/withdraw`, {
      gameId,
      amount: usdAmount,
      address: walletAddress,
      network: selectedNetwork // ✅ sends lightning OR onchain!
    });

    console.log('✅ Withdraw request submitted:', response.data);
    toast.success('Withdraw request submitted!');
    setActiveModal(null);
  } catch (error) {
    console.error('Withdraw error:', error.response?.data || error.message);
    toast.error('❌ Failed to submit withdraw request.');
  }
};




  const closeModal = () => {
    const closingModal = activeModal;
    setActiveModal(null);
    if (closingModal === 'payment') {
      setPaymentStatus('pending');
      setPaymentId('');
      setPaymentAddress('');
      reset(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="flex items-center p-6">
        <div className="w-12 h-12">
          <img src="/logo.png" alt="SEARN Gaming Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-gaming-green">Searn Gaming Portal</h1>
      </div>
      <div className="px-6 pb-6">
        <div className="bg-hero-gradient rounded-2xl p-8 mb-8 text-center">
          <h2 className="text-4xl md:text-4xl sm:text-2xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Premium Bitcoin Gaming Experience
          </h2>
          <p className="text-[#9ca3af] text-lg">
            Lightning-fast deposits, instant gameplay, secure withdrawals.
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:justify-center gap-8">
          <div className="w-full sm:w-4/5 md:w-80 self-start sm:self-center md:self-auto p-6 rounded-xl bg-[#1f2937] shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Deposit</h3>
            <p className="text-gray-400 mb-8">Minimum $20 deposit required.</p>
            <button
              onClick={() => setActiveModal('deposit')}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              Deposit Now
            </button>
          </div>

          <div className="w-full sm:w-3/4 md:w-80 self-end sm:self-center md:self-auto p-6 rounded-xl bg-[#1f2937] shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Redeem Winnings</h3>
            <p className="text-gray-400 mb-8">Cash out your winnings to any BTC wallet.</p>
            <button
              onClick={() => setActiveModal('redeem')}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              Redeem Now
            </button>
          </div>
        </div>



        {/* <div className="flex flex-col md:flex-row gap-8 justify-center">
          <div className="w-80 p-6 rounded-xl bg-[#1f2937] shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Deposit</h3>
            <p className="text-gray-400 mb-8">Minimum $20 deposit required.</p>
            <button
              onClick={() => setActiveModal('deposit')}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              Deposit Now
            </button>
          </div>

          <div className="w-80 p-6 rounded-xl bg-[#1f2937] shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Redeem Winnings</h3>
            <p className="text-gray-400 mb-8">Cash out your winnings to any BTC wallet.</p>
            <button
              onClick={() => setActiveModal('redeem')}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              Redeem Now
            </button>
          </div>
        </div> */}
      </div>
      <a
        href="https://t.me/YourSupportBot"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        Support
      </a>



      {/* Modals */}
      {activeModal === 'deposit' && (
        <Modal onClose={closeModal}>
          <DepositModal
            gameId={gameId}
            setGameId={setGameId}
            amount={amount}
            setAmount={setAmount}
            selectedNetwork={selectedNetwork}
            setSelectedNetwork={setSelectedNetwork}
            onGeneratePayment={generatePayment}
          />
        </Modal>
      )}

      {activeModal === 'payment' && (
        <Modal onClose={closeModal}>
          <PaymentModal
            paymentAddress={paymentAddress}
            timeLeft={timeLeft}
            formatTime={formatTime}
            paymentStatus={paymentStatus}
          />
        </Modal>
      )}

      {activeModal === 'redeem' && (
        <Modal onClose={closeModal}>
          <RedeemModal
            gameId={gameId}
            setGameId={setGameId}
            walletAddress={walletAddress}
            setWalletAddress={setWalletAddress}
            redeemAmount={redeemAmount}
            setRedeemAmount={setRedeemAmount}
            selectedNetwork={selectedNetwork}
            setSelectedNetwork={setSelectedNetwork}
            onSubmitRedemption={submitRedemption}
          />
        </Modal>
      )}
    </div>
  );
};

export default EliteGamingPortal;
