
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { View } from '../types';
import Button from './common/Button';

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
    const { user, isAdmin, logout } = useAuth();
    
    const handleLogout = () => {
        logout();
        onNavigate(View.LANDING);
    }
    
    const showBackButton = ![View.LANDING, View.VOTER_DASHBOARD, View.ADMIN_DASHBOARD].includes(currentView) && !user && !isAdmin;

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {showBackButton && (
                         <button onClick={() => onNavigate(View.LANDING)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                         </button>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">🗳️ Digital Voting System</h1>
                </div>
                {(user || isAdmin) && (
                    <div className="w-24">
                        <Button onClick={handleLogout} variant="secondary">
                            Logout
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
