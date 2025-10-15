import React, { useState } from 'react';
import Layout from '../layout/Layout';
import DashboardContent from '../dashboard/DashboardContent';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { getUserMerchant } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMerchantForm, setShowMerchantForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState(null);

  const userMerchant = getUserMerchant();

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <DashboardContent 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showMerchantForm={showMerchantForm}
        setShowMerchantForm={setShowMerchantForm}
        showUserForm={showUserForm}
        setShowUserForm={setShowUserForm}
        editingMerchant={editingMerchant}
        setEditingMerchant={setEditingMerchant}
        userMerchant={userMerchant}
      />
    </Layout>
  );
};

export default Dashboard;