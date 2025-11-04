
import React, { useState } from 'react';
import CandidateManagement from './CandidateManagement';
import VotingAnalytics from './VotingAnalytics';
import AdminAuditLog from './AdminAuditLog';

type Tab = 'management' | 'analytics' | 'logs';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('management');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'management':
                return <CandidateManagement />;
            case 'analytics':
                return <VotingAnalytics />;
            case 'logs':
                return <AdminAuditLog />;
            default:
                return null;
        }
    };
    
    const TabButton: React.FC<{tabId: Tab; children: React.ReactNode}> = ({tabId, children}) => (
         <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200
                ${activeTab === tabId 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6">Administrator Dashboard</h2>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tabId="management">Candidate Management</TabButton>
                    <TabButton tabId="analytics">Voting Analytics</TabButton>
                    <TabButton tabId="logs">Audit Logs</TabButton>
                </nav>
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;
