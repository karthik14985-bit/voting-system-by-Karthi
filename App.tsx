
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { View } from './types';
import VoterLogin from './components/voter/VoterLogin';
import VoterRegistration from './components/voter/VoterRegistration';
import VotingDashboard from './components/voter/VotingDashboard';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

/**
 * Determines the view to display based on the browser's URL path.
 * @returns {View} The view enum member.
 */
const getViewFromPath = (): View => {
    if (window.location.pathname === '/karthiadmin') {
        return View.ADMIN_LOGIN;
    }
    return View.LANDING;
};

const AppContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(getViewFromPath());
    const { user, isLoading } = useAuth();

    // Effect to handle browser back/forward navigation.
    useEffect(() => {
        const handlePopState = () => {
            // Update the view based on the URL when the user navigates using browser buttons.
            setCurrentView(getViewFromPath());
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleNavigation = (view: View) => {
        setCurrentView(view);
        
        // Update browser history to reflect navigation changes for a better SPA experience.
        const path = view === View.ADMIN_LOGIN ? '/karthiadmin' : '/';
        const title = view === View.ADMIN_LOGIN ? 'Admin Login' : 'Digital Voting System';
        
        // We only push state for the main entry points (landing and admin login)
        // to avoid cluttering browser history with intermediate steps like registration.
        if ((view === View.ADMIN_LOGIN || view === View.LANDING) && window.location.pathname !== path) {
            window.history.pushState({ view }, title, path);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl font-semibold">Authenticating...</div>
            </div>
        );
    }

    const renderContent = () => {
        if (user) {
            // If a user is logged in, show the appropriate dashboard, ignoring the currentView state.
            if (user.id === 'admin001') {
                return <AdminDashboard />;
            }
            return <VotingDashboard />;
        }

        // If no user is logged in, show view based on state.
        switch (currentView) {
            case View.VOTER_LOGIN:
                return <VoterLogin onNavigate={handleNavigation} />;
            case View.VOTER_REGISTER:
                return <VoterRegistration onNavigate={handleNavigation} />;
            case View.ADMIN_LOGIN:
                return <AdminLogin onNavigate={handleNavigation} />;
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
