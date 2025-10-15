import React, { useState, useEffect ,useMemo, useCallback } from "react";
import { TrendingUp, ArrowUpRight, Trophy, Clock, Building } from 'lucide-react';
import Card from '../ui/Card';
import Button from "../ui/Button";
import { Send } from "lucide-react";
import { useNotification } from '../../hooks/useNotification';
import api from '../../utils/axios';
import { useAuth } from "../../contexts/AuthContext"; // ✅ get user role
import { formatCurrency } from '../../utils/formatters';
import MerchantDepositModal from './MerchantDepositModal';
import MerchantWithdrawModal from './MerchantWithdrawModal';


const DashboardStats = () => {
  const { user, transactions, allMerchants, refreshTransactions } = useAuth();
  const role = user?.role || '';
  const isSuper = ['super_admin', 'super_manager'].includes(role);
  const canViewPendingStats = ['super_admin', 'super_manager', 'store_admin', 'store_manager', 'store_cashier'].includes(role);
  const canShowBalance = role === 'store_admin';
  const [balances, setBalances] = useState({ usd: 0, sats: 0 });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [apiStats, setApiStats] = useState(null);
  const { addNotification } = useNotification();



const localStats = useMemo(() => {
    const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status == 'paid').reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status == 'completed').reduce((sum, t) => sum + t.amount, 0);
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const pendingWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'pending');
    const pendingWithdrawRequests = pendingWithdrawals.length;
    const pendingWithdrawAmount = pendingWithdrawals.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalDepositCustomers = transactions.filter(t => t.type === 'deposit' && t.status == 'paid' && t.isInternal == false ).reduce((sum, t) => sum + t.amount, 0);
    // const todayTransactions = transactions.filter(t => {
    //   const today = new Date().toISOString().split('T')[0];
    //   const transactionDate = new Date(t.date).toISOString().split('T')[0];
    //   return transactionDate === today;
    // }).length;
    const todayTransactions = 0;

    const totalRevenue = isSuper 
      ? allMerchants.reduce((sum, m) => sum + (m.monthlyRevenue || 0), 0)
      : 0;

    return {
      totalDeposits,
      totalWithdrawals,
      netBalance: totalDeposits - totalWithdrawals,
      pendingTransactions,
      todayTransactions,
      totalMerchants: isSuper ? allMerchants.length : 1,
      totalTransactions: transactions.length,
      totalRevenue,
      pendingWithdrawRequests,
      pendingWithdrawAmount,
      totalDepositCustomers
    };
  }, [transactions, allMerchants, isSuper]);
  

  // place above the return, after localStats/apiStats definitions
const buildStatCards = () => {
  const cards = [
    // Deposit
    {
      key: 'deposit',
      title: 'Deposit',
      value: formatCurrency(isSuper ? (apiStats?.totalDeposit || 0) : localStats.totalDeposits),
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      change: '+15.2%',          // optional: wire to your own trend data
      changeType: 'positive'
    },
{
      key: 'custoer_deposit',
      title: 'Customer Deposit',
      value: formatCurrency(isSuper ? (apiStats?.totalDepositCustomers || 0) : localStats.totalDepositCustomers),
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      change: '+15.2%',          // optional: wire to your own trend data
      changeType: 'positive'
    },

    // Withdraw
    {
      key: 'withdraw',
      title: 'Withdraw',
      value: formatCurrency(isSuper ? (apiStats?.totalWithdraw || 0) : localStats.totalWithdrawals),
      icon: ArrowUpRight,
      color: 'text-orange-400',
      bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
      change: '+8.7%',
      changeType: 'positive'
    },
  ];

  if (canViewPendingStats) {
    const pendingCount = isSuper ? (apiStats?.totalPendingWithdrawRequests ?? 0) : localStats.pendingWithdrawRequests;
    const pendingAmount = isSuper ? (apiStats?.pendingWithdrawAmount || 0) : localStats.pendingWithdrawAmount;

    cards.push(
      {
        key: 'pending_withdraw_requests',
        title: 'Pending Withdraw Requests',
        value: pendingCount,
        icon: Clock,
        color: 'text-indigo-400',
        bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        change: '',
        changeType: 'neutral'
      },
      {
        key: 'pending_withdraw_amount',
        title: 'Pending withdraw Amount',
        value: formatCurrency(pendingAmount || 0),
        icon: Clock,
        color: 'text-indigo-400',
        bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        change: '',
        changeType: 'neutral'
      }
    );
  }

  if (isSuper) {
    // Put Gaming Partners card at the very front
    cards.unshift({
      key: 'partners',
      title: 'Gaming Partners',
      value: apiStats?.gamingPartners ?? 0,
      icon: Building,
      color: 'text-teal-400',
      bgColor: 'bg-gradient-to-r from-teal-500 to-cyan-500',
      change: '+5.0%',
      changeType: 'positive'
    });

    
    cards.push(
      {
        key: 'commission',
        title: 'Commission Earned',
        value: formatCurrency(apiStats?.totalCommission || 0),
        icon: Trophy,
        color: 'text-yellow-400',
        bgColor: 'bg-gradient-to-r from-yellow-500 to-amber-500',
        change: '',
        changeType: 'neutral'
      },
      {
        key: 'games_created',
        title: 'Games',
        value: apiStats?.gamesCount ?? 0,
        icon: Clock,
        color: 'text-indigo-400',
        bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        change: '',
        changeType: 'neutral'
      },


    );

  }

  return cards;
};



  const statCards = buildStatCards();

  // if (user.role === 'super_admin') {
  //   statCards.unshift({
  //     title: 'Gaming Partners',
  //     value: localStats.totalMerchants,
  //     icon: Building,
  //     color: 'text-teal-400',
  //     bgColor: 'bg-gradient-to-r from-teal-500 to-cyan-500',
  //     change: '+5.0%',
  //     changeType: 'positive'
  //   });
  // }

  useEffect(() => {
    if (!isSuper) return;
    let mounted = true;
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        if (mounted) setApiStats(data || null);
      } catch (err) {
        console.error('Error fetching /stats', err);
      }
    };
    fetchStats();
    return () => {
      mounted = false;
    };
  }, [isSuper]);



  const fetchBalance = useCallback(async () => {
    try {
      const { data } = await api.get("/merchants/balance");
      setBalances({
        usd: Number(data?.balanceUsd) || 0,
        sats: Number(data?.balanceSats) || 0,
      });
    } catch (err) {
      console.error("Error fetching balance", err);
      setBalances({ usd: 0, sats: 0 });
    }
  }, []);

  useEffect(() => {
    if (canShowBalance) fetchBalance();
  }, [canShowBalance, fetchBalance]);

  const handleWithdrawPartial = useCallback(async ({ amountSats ,amount, network, address }) => {
    console.log("amount>>>>>>>",amount, amountSats);
    try {
      await api.post('/merchants/withdraw', {
        amountSats,
        amount,
        network,
        address,
      });
      addNotification('Withdrawal request submitted.', 'success');
      await fetchBalance();
      await refreshTransactions?.();
      return true;
    } catch (err) {
      console.error('Withdraw error', err);
      const message = err?.response?.data?.error || 'Withdrawal failed.';
      addNotification(message, 'error');
      return false;
    }
  }, [fetchBalance, addNotification, refreshTransactions]);

  const handleWithdrawAll = useCallback(async ({ network, address }) => {
    try {
      await api.post('/merchants/withdraw-all', {
        network,
        address,
      });
      addNotification('Withdrawal of full balance submitted.', 'success');
      await fetchBalance();
      await refreshTransactions?.();
      return true;
    } catch (err) {
      console.error('Withdraw all error', err);
      const message = err?.response?.data?.error || 'Withdraw all failed.';
      addNotification(message, 'error');
      return false;
    }
  }, [fetchBalance, addNotification, refreshTransactions]);

  // if (!canWithdraw) return null; // ✅ Hide entire section for Super Admin

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="p-6 bg-gray-800 hover:bg-gray-700 hover:scale-105 transition-all duration-300 cursor-pointer rounded-2xl shadow-md group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              
            </div>
            
          </div>
        </Card>
      ))}
    </div>
    {canShowBalance &&
      <div className="p-4 text-white bg-gray-900 rounded space-y-4">
        <div className="space-y-1">
          <span className="text-lg">USD Balance: {formatCurrency(balances.usd)}</span>
          <p className="text-sm text-gray-400">{Math.round(balances.sats).toLocaleString()} sats</p>
        </div>

        <p className="text-sm leading-relaxed">
          <span className="text-indigo-300">The USD value displayed is a converted market value of Satoshis to USD, calculated using kraken</span>
        </p>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowWithdrawModal(true)}>
            <Send className="w-4 h-4 mr-2" />
            Withdraw
          </Button>
          <Button variant="secondary" onClick={() => setShowDepositModal(true)}>
            Deposit
          </Button>
        </div>

        <MerchantWithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          balances={balances}
          onWithdrawPartial={handleWithdrawPartial}
          onWithdrawAll={handleWithdrawAll}
          allowUsdMode={true}
        />
        <MerchantDepositModal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
        />
      </div>
    }
    </>
  );
};

export default DashboardStats;
