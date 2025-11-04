import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { View } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface VoterLoginProps {
  onNavigate: (view: View) => void;
}

const VoterLogin: React.FC<VoterLoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // In a real app, password would be hashed before sending.
      // For this demo, we're using it as is.
      await login(email, password);
    } catch (err: any) {
       setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Voter Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            id="email"
            label="Email"
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            disabled={isLoading}
          />
          <Input
            id="password" 
            label="Password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            disabled={isLoading}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="text-center mt-6 text-sm">
          Don't have an account?{' '}
          <button onClick={() => onNavigate(View.VOTER_REGISTER)} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50" disabled={isLoading}>
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default VoterLogin;
