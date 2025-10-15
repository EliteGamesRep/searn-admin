import React, { useState } from 'react';
import { Shield, Mail, Eye, EyeOff, Zap } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validators';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();

  const handleSubmit = async () => {
    const newErrors = {};
    
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email';
    if (!password.trim()) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      await login(email, password);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12">
              {/* <Shield className="h-8 w-8 text-white" /> */}
              <img src="/logo.png" alt="SEARN Gaming Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Gaming Admin Portal</h1>
          <p className="text-gray-400 text-lg">Searn Gaming Management System</p>
        </div>
        
        <Card className="p-8 backdrop-blur-sm">
          <div className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              error={errors.email}
              icon={Mail}
              placeholder="Enter your admin email"
            />
            
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                error={errors.password}
                icon={Shield}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="w-full"
              size="large"
            >
              <Zap className="h-5 w-5 mr-2" />
              Access Admin Portal
            </Button>
          </div>
        </Card>
        
      </div>
    </div>
  );
};

export default Login;