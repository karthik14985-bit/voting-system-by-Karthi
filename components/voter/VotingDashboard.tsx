import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVotingData } from '../../hooks/useVotingData';
import type { Candidate } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';

const CandidateCard: React.FC<{
    candidate: Candidate;
    onVote: (candidateId: string) => void;
    hasVoted: boolean;
    votedForThisCandidate: boolean;
}> = ({ candidate, onVote, hasVoted, votedForThisCandidate }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${votedForThisCandidate ? 'ring-4 ring-green-500' : ''}`}>
            <img className="w-full h-56 object-cover bg-gray-200 dark:bg-gray-700" src={candidate.photoUrl} alt={candidate.name} />
            <div className="p-6">
                <h3 className="text-2xl font-bold mb-1">{candidate.name}</h3>
                <p className="text-blue-500 dark:text-blue-400 font-semibold mb-3">{candidate.party}</p>
                <p className="text-gray-600 dark:text-gray-300 mb-4 h-20 overflow-y-auto">{candidate.description}</p>
                <Button onClick={() => onVote(candidate.id)} disabled={hasVoted}>
                    {votedForThisCandidate ? 'Voted' : (hasVoted ? 'Vote Cast' : 'Vote Now')}
                </Button>
            </div>
        </div>
    );
};

const VotingDashboard: React.FC = () => {
    const { user, setUser } = useAuth();
    const { candidates, castVote, updateUserFromVoter, isLoading } = useVotingData();
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!user) return null;

    const handleVoteClick = (candidateId: string) => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
            setSelectedCandidate(candidate);
            setIsModalOpen(true);
        }
    };

    const confirmVote = async () => {
        if (user && selectedCandidate) {
            setIsSubmitting(true);
            const success = await castVote(user.id, selectedCandidate.id);
            if (success) {
                const updatedUser = { ...user, votedCandidateId: selectedCandidate.id };
                setUser(updatedUser);
                await updateUserFromVoter(updatedUser);
            }
            setIsSubmitting(false);
        }
        setIsModalOpen(false);
        setSelectedCandidate(null);
    };

    const hasVoted = !!user.votedCandidateId;
    const votedCandidate = candidates.find(c => c.id === user.votedCandidateId);

    if (isLoading.candidates) {
        return <div className="text-center p-10">Loading candidates...</div>
    }

    return (
        <div>
            {hasVoted ? (
                <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg max-w-2xl mx-auto">
                    <h2 className="text-4xl font-extrabold text-green-600 dark:text-green-400 mb-4">Thank You for Voting!</h2>
                    <p className="text-lg mb-6">Your vote has been securely recorded.</p>
                    {votedCandidate && (
                         <div className="border-2 border-green-500 p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-2">You voted for:</h3>
                            <img src={votedCandidate.photoUrl} alt={votedCandidate.name} className="w-32 h-32 rounded-full mx-auto mb-4" />
                            <p className="text-2xl font-semibold">{votedCandidate.name}</p>
                            <p className="text-gray-500 dark:text-gray-400">{votedCandidate.party}</p>
                         </div>
                    )}
                </div>
            ) : (
                <>
                    <h2 className="text-3xl font-bold text-center mb-8">Cast Your Vote</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {candidates.map(candidate => (
                            <CandidateCard 
                                key={candidate.id} 
                                candidate={candidate} 
                                onVote={handleVoteClick}
                                hasVoted={hasVoted}
                                votedForThisCandidate={user.votedCandidateId === candidate.id}
                            />
                        ))}
                    </div>
                </>
            )}

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Confirm Your Vote"
            >
                {selectedCandidate && (
                    <div className="text-center">
                        <p className="mb-4 text-lg">Are you sure you want to vote for</p>
                        <p className="text-2xl font-bold mb-1">{selectedCandidate.name}</p>
                        <p className="text-blue-500 dark:text-blue-400 font-semibold mb-6">{selectedCandidate.party}</p>
                        <p className="text-sm text-red-500 mb-6">This action is final and cannot be undone.</p>
                        <div className="flex justify-center space-x-4">
                            <Button onClick={confirmVote} className="w-1/2" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Confirm Vote'}
                            </Button>
                            <Button onClick={() => setIsModalOpen(false)} variant="secondary" className="w-1/2" disabled={isSubmitting}>Cancel</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default VotingDashboard;
