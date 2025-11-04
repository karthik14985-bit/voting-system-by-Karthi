import React from 'react';
import { useVotingData } from '../../hooks/useVotingData';

const AdminAuditLog: React.FC = () => {
    const { logs, isLoading } = useVotingData();

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Administrator Action Logs</h3>
            <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading.logs ? (
                        <li className="p-4 text-center text-gray-500 dark:text-gray-400">Loading logs...</li>
                    ) : logs.length > 0 ? logs.map(log => (
                        <li key={log.id} className="p-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{log.action}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(log.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </li>
                    )) : (
                        <li className="p-4 text-center text-gray-500 dark:text-gray-400">No admin actions logged yet.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AdminAuditLog;
