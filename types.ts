export interface User {
  id: string;
  fullName: string;
  email: string;
  votedCandidateId: string | null;
}

export interface UserRegistrationData extends Omit<User, 'id' | 'votedCandidateId'> {
  age: number;
  passwordHash: string; // This is sent to the backend, not stored on the client.
  aadhaarNumber: string; // This is sent to the backend, not stored on the client.
}


export interface Candidate {
  id: string;
  name: string;
  party: string;
  photoUrl: string;
  description: string;
  votes: number;
}

// Fix: Add Log interface for admin audit logs.
export interface Log {
  id: string;
  action: string;
  timestamp: number;
}

export enum View {
  LANDING,
  VOTER_LOGIN,
  VOTER_REGISTER,
  VOTER_DASHBOARD,
  // Fix: Add ADMIN_LOGIN and ADMIN_DASHBOARD to support admin views.
  ADMIN_LOGIN,
  ADMIN_DASHBOARD,
}
