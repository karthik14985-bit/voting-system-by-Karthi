import { useState, useEffect, useCallback } from 'react';
// Fix: Import Log type for audit logs.
import type { User, Candidate, UserRegistrationData, Log } from '../types';

// This section simulates a backend API interacting with a database (localStorage in this case).
// In a real app, these would be `fetch` calls to your Flask backend endpoints.
const MOCK_API = {
    delay: (ms: number) => new Promise(res => setTimeout(res, ms)),
    
    // Simulates GET /api/candidates
    getCandidates: async (): Promise<Candidate[]> => {
        await MOCK_API.delay(800);
        const stored = localStorage.getItem('candidates');
        
        if (stored) {
            return JSON.parse(stored);
        }

        const initialCandidates: Candidate[] = [
          { id: 'c1', name: 'Aarav Sharma', party: 'Progressive Party', photoUrl: 'https://picsum.photos/seed/aarav/400/400', description: 'Focused on economic growth and technological innovation.', votes: 125 },
          { id: 'c2', name: 'Saanvi Patel', party: 'Unity Alliance', photoUrl: 'https://picsum.photos/seed/saanvi/400/400', description: 'Advocating for social justice and environmental protection.', votes: 110 },
          { id: 'c3', name: 'Vikram Singh', party: 'National Vision Party', photoUrl: 'https://picsum.photos/seed/vikram/400/400', description: 'Championing traditional values and national security.', votes: 95 },
        ];
        // Persist initial data if it doesn't exist to ensure consistency.
        localStorage.setItem('candidates', JSON.stringify(initialCandidates));
        return initialCandidates;
    },

    // Simulates GET /api/users
    getUsers: async (): Promise<User[]> => {
        await MOCK_API.delay(600);
        const stored = localStorage.getItem('users');
        return stored ? JSON.parse(stored) : [];
    },

    // Fix: Add getLogs to simulate fetching audit logs.
    getLogs: async (): Promise<Log[]> => {
        await MOCK_API.delay(300);
        const stored = localStorage.getItem('logs');
        return stored ? JSON.parse(stored) : [];
    },


    // Simulates saving data to the backend
    saveData: async (key: 'users' | 'candidates' | 'logs', data: any) => {
        await MOCK_API.delay(200);
        localStorage.setItem(key, JSON.stringify(data));
    }
};


export const useVotingData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  // Fix: Add state for audit logs.
  const [logs, setLogs] = useState<Log[]>([]);
  // Fix: Add 'logs' to the loading state object.
  const [isLoading, setIsLoading] = useState({ users: true, candidates: true, logs: true });

  const fetchData = useCallback(async () => {
    // Fix: Add 'logs' to the loading state update.
    setIsLoading({ users: true, candidates: true, logs: true });
    try {
        const [candidateData, userData, logData] = await Promise.all([
            MOCK_API.getCandidates(),
            MOCK_API.getUsers(),
            // Fix: Fetch logs data.
            MOCK_API.getLogs(),
        ]);
        setCandidates(candidateData);
        setUsers(userData);
        // Fix: Set logs state, sorted by most recent.
        setLogs(logData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
        console.error("Failed to fetch voting data:", error);
    } finally {
        // Fix: Add 'logs' to the loading state update.
        setIsLoading({ users: false, candidates: false, logs: false });
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Add storage event listener to sync data across tabs.
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'users' || event.key === 'candidates' || event.key === 'logs') {
            fetchData();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchData]);

  // Fix: Add function to create a new audit log entry.
  const addLog = async (action: string) => {
    const currentLogs = await MOCK_API.getLogs();
    const newLog: Log = {
        id: Date.now().toString(),
        action,
        timestamp: Date.now(),
    };
    const updatedLogs = [newLog, ...currentLogs];
    await MOCK_API.saveData('logs', updatedLogs);
    setLogs(updatedLogs.sort((a, b) => b.timestamp - a.timestamp));
  };


  const addUser = async (user: UserRegistrationData): Promise<{ success: boolean, message: string }> => {
    const currentUsers = await MOCK_API.getUsers();
    if (currentUsers.some(u => u.email === user.email)) {
      return { success: false, message: 'Email already exists.' };
    }
    if (currentUsers.some(u => (u as any).aadhaarNumber === user.aadhaarNumber)) {
        return { success: false, message: 'Aadhaar number already registered.' };
    }
    const newUser: User & { aadhaarNumber: string, passwordHash: string } = { ...user, id: Date.now().toString(), votedCandidateId: null };
    await MOCK_API.saveData('users', [...currentUsers, newUser]);
    return { success: true, message: 'Registration successful!' };
  };

  const castVote = async (userId: string, candidateId: string): Promise<boolean> => {
    const currentUsers = await MOCK_API.getUsers();
    const currentUser = currentUsers.find(u => u.id === userId);

    if (!currentUser || currentUser.votedCandidateId) {
        return false;
    }

    const updatedUsers = currentUsers.map(u => u.id === userId ? { ...u, votedCandidateId: candidateId } : u);
    await MOCK_API.saveData('users', updatedUsers);
    
    const currentCandidates = await MOCK_API.getCandidates();
    const updatedCandidates = currentCandidates.map(c => c.id === candidateId ? { ...c, votes: c.votes + 1 } : c);
    await MOCK_API.saveData('candidates', updatedCandidates);

    setCandidates(updatedCandidates); // Optimistic update
    return true;
  };
  
  const updateUserFromVoter = async (updatedUser: User) => {
    const currentUsers = await MOCK_API.getUsers();
    const updatedUsers = currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    await MOCK_API.saveData('users', updatedUsers);
  };

  // Fix: Add function to create a new candidate.
  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'votes'>) => {
    const currentCandidates = await MOCK_API.getCandidates();
    const newCandidate: Candidate = {
        ...candidateData,
        id: `c${Date.now()}`,
        votes: 0,
    };
    const updatedCandidates = [...currentCandidates, newCandidate];
    await MOCK_API.saveData('candidates', updatedCandidates);
    setCandidates(updatedCandidates);
    await addLog(`Added new candidate: ${newCandidate.name}`);
  };

  // Fix: Add function to update an existing candidate.
  const updateCandidate = async (updatedCandidate: Candidate) => {
    const currentCandidates = await MOCK_API.getCandidates();
    const updatedCandidates = currentCandidates.map(c => c.id === updatedCandidate.id ? updatedCandidate : c);
    await MOCK_API.saveData('candidates', updatedCandidates);
    setCandidates(updatedCandidates);
    await addLog(`Updated candidate details for: ${updatedCandidate.name}`);
  };

  // Fix: Add function to delete a candidate.
  const deleteCandidate = async (candidateId: string) => {
    const currentCandidates = await MOCK_API.getCandidates();
    const candidateToDelete = currentCandidates.find(c => c.id === candidateId);
    const updatedCandidates = currentCandidates.filter(c => c.id !== candidateId);
    await MOCK_API.saveData('candidates', updatedCandidates);
    setCandidates(updatedCandidates);
    if (candidateToDelete) {
        await addLog(`Deleted candidate: ${candidateToDelete.name}`);
    }
  };


  // Fix: Export new state and functions for admin components.
  return { users, candidates, logs, isLoading, addUser, castVote, updateUserFromVoter, addCandidate, updateCandidate, deleteCandidate };
};
