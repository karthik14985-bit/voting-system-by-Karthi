
import React from 'react';
import { View } from '../types';
import Button from './common/Button';

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-2xl shadow-xl max-w-lg w-full">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-800 dark:text-white">Welcome to the Polls</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Your voice matters. Cast your vote securely or manage the election.
        </p>
        <div className="space-y-4">
          <Button onClick={() => onNavigate(View.VOTER_LOGIN)}>
            Voter Portal
          </Button>
          <Button onClick={() => onNavigate(View.ADMIN_LOGIN)} variant="secondary">
            Administrator Portal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
