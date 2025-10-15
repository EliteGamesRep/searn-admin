import React from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import NotificationToast from './components/ui/NotificationToast';
import { useAuth } from './hooks/useAuth';

const AppContent = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
};

const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
        <NotificationToast />
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;