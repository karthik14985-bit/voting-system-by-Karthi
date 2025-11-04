import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { View } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import { ADMIN_CREDENTIALS } from '../../constants';

interface AdminLoginProps {
  onNavigate: (view: View) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { adminLogin, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
        await adminLogin(email, password);
        onNavigate(View.ADMIN_DASHBOARD);
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            id="admin-email"
            label="Admin Email"
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            placeholder={ADMIN_CREDENTIALS.email}
            disabled={isLoading}
          />
          <Input 
            id="admin-password"
            label="Admin Password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder={ADMIN_CREDENTIALS.password}
            disabled={isLoading}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login as Admin'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
