import { useState, useEffect, useCallback } from 'react';
import type { User, Candidate, AdminActionLog, UserRegistrationData } from '../types';

// This section simulates a backend API interacting with a database (localStorage in this case).
// In a real app, these would be `fetch` calls to your Flask backend endpoints.
const MOCK_API = {
    delay: (ms: number) => new Promise(res => setTimeout(res, ms)),
    
    // Simulates GET /api/candidates
    getCandidates: async (): Promise<Candidate[]> => {
        await MOCK_API.delay(800);
        const stored = localStorage.getItem('candidates');
        const initialCandidates: Candidate[] = [
          { id: 'c1', name: 'Aarav Sharma', party: 'Progressive Party', photoUrl: 'https://picsum.photos/seed/aarav/400/400', description: 'Focused on economic growth and technological innovation.', votes: 125 },
          { id: 'c2', name: 'Saanvi Patel', party: 'Unity Alliance', photoUrl: 'https://picsum.photos/seed/saanvi/400/400', description: 'Advocating for social justice and environmental protection.', votes: 110 },
          { id: 'c3', name: 'Vikram Singh', party: 'National Vision Party', photoUrl: 'https://picsum.photos/seed/vikram/400/400', description: 'Championing traditional values and national security.', votes: 95 },
        ];
        return stored ? JSON.parse(stored) : initialCandidates;
    },

    // Simulates GET /api/admin/logs
    getLogs: async (): Promise<AdminActionLog[]> => {
        await MOCK_API.delay(400);
        const stored = localStorage.getItem('adminLogs');
        return stored ? JSON.parse(stored) : [];
    },

    // Simulates GET /api/users
    getUsers: async (): Promise<User[]> => {
        await MOCK_API.delay(600);
        const stored = localStorage.getItem('users');
        return stored ? JSON.parse(stored) : [];
    },

    // Simulates saving data to the backend
    saveData: async (key: 'users' | 'candidates' | 'adminLogs', data: any) => {
        await MOCK_API.delay(200);
        localStorage.setItem(key, JSON.stringify(data));
    }
};


export const useVotingData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [logs, setLogs] = useState<AdminActionLog[]>([]);
  const [isLoading, setIsLoading] = useState({ users: true, candidates: true, logs: true });

  const fetchData = useCallback(async () => {
    setIsLoading({ users: true, candidates: true, logs: true });
    try {
        const [candidateData, logData, userData] = await Promise.all([
            MOCK_API.getCandidates(),
            MOCK_API.getLogs(),
            MOCK_API.getUsers(),
        ]);
        setCandidates(candidateData);
        setLogs(logData);
        setUsers(userData);
    } catch (error) {
        console.error("Failed to fetch voting data:", error);
    } finally {
        setIsLoading({ users: false, candidates: false, logs: false });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const logAdminAction = useCallback(async (action: string) => {
    const currentLogs = await MOCK_API.getLogs();
    const newLog: AdminActionLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action,
    };
    const updatedLogs = [newLog, ...currentLogs];
    await MOCK_API.saveData('adminLogs', updatedLogs);
    setLogs(updatedLogs);
  }, []);
  
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

  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'votes'>) => {
    await logAdminAction(`Added candidate: ${candidateData.name}`);
    const currentCandidates = await MOCK_API.getCandidates();
    const newCandidate: Candidate = { ...candidateData, id: Date.now().toString(), votes: 0 };
    const updatedCandidates = [...currentCandidates, newCandidate];
    await MOCK_API.saveData('candidates', updatedCandidates);
    setCandidates(updatedCandidates);
  };

  const updateCandidate = async (updatedCandidate: Candidate) => {
    await logAdminAction(`Updated candidate: ${updatedCandidate.name}`);
    const currentCandidates = await MOCK_API.getCandidates();
    const updatedCandidates = currentCandidates.map(c => c.id === updatedCandidate.id ? updatedCandidate : c);
    await MOCK_API.saveData('candidates', updatedCandidates);
    setCandidates(updatedCandidates);
  };
  
  const deleteCandidate = async (candidateId: string) => {
    const currentCandidates = await MOCK_API.getCandidates();
    const candidateToDelete = currentCandidates.find(c => c.id === candidateId);
    if(candidateToDelete) {
        await logAdminAction(`Deleted candidate: ${candidateToDelete.name}`);
    }
    const updatedCandidates = currentCandidates.filter(c => c.id !== candidateId);
    await MOCK_API.saveData('candidates', updatedCandidates);
    setCandidates(updatedCandidates);
  };

  return { users, candidates, logs, isLoading, addUser, castVote, updateUserFromVoter, addCandidate, updateCandidate, deleteCandidate };
};
