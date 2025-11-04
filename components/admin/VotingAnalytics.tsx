import React from 'react';
import { useVotingData } from '../../hooks/useVotingData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsCard: React.FC<{ title: string; value: string | number; isLoading: boolean }> = ({ title, value, isLoading }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{title}</h3>
        <p className="text-4xl font-bold">{isLoading ? '...' : value}</p>
    </div>
);


const VotingAnalytics: React.FC = () => {
    const { candidates, users, isLoading } = useVotingData();

    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
    const totalRegisteredVoters = users.length;
    const votersWhoVoted = users.filter(u => u.votedCandidateId).length;
    const voterTurnout = totalRegisteredVoters > 0 ? ((votersWhoVoted / totalRegisteredVoters) * 100).toFixed(2) : 0;

    const chartData = candidates.map(c => ({
        name: c.name,
        Votes: c.votes,
    })).sort((a,b) => b.Votes - a.Votes);
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <AnalyticsCard title="Total Votes Cast" value={totalVotes} isLoading={isLoading.candidates} />
                <AnalyticsCard title="Registered Voters" value={totalRegisteredVoters} isLoading={isLoading.users} />
                <AnalyticsCard title="Voter Turnout" value={`${voterTurnout}%`} isLoading={isLoading.users} />
            </div>

            <h3 className="text-2xl font-bold mb-4">Candidate Results</h3>
             {isLoading.candidates ? (
                <div className="text-center p-10">Loading chart data...</div>
            ) : (
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 5, right: 30, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)', // gray-800 with opacity
                                    border: '1px solid #4B5563', // gray-600
                                    color: '#F9FAFB' // gray-50
                                }}
                            />
                            <Legend />
                            <Bar dataKey="Votes" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default VotingAnalytics;
