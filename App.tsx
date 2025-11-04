
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { View } from './types';
import VoterLogin from './components/voter/VoterLogin';
import VoterRegistration from './components/voter/VoterRegistration';
import VotingDashboard from './components/voter/VotingDashboard';
import Header from './components/Header';
import LandingPage from './components/LandingPage';

const AppContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.LANDING);
    const { user } = useAuth();

    const handleNavigation = (view: View) => {
        setCurrentView(view);
    };

    const renderContent = () => {
        if (user) {
            return <VotingDashboard />;
        }

        switch (currentView) {
            case View.VOTER_LOGIN:
                return <VoterLogin onNavigate={handleNavigation} />;
            case View.VOTER_REGISTER:
                return <VoterRegistration onNavigate={handleNavigation} />;
            case View.LANDING:
            default:
                return <LandingPage onNavigate={handleNavigation} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Header currentView={currentView} onNavigate={handleNavigation} />
            <main className="container mx-auto p-4 sm:p-6 md:p-8">
                {renderContent()}
            </main>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
