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

export interface AdminActionLog {
    id: string;
    timestamp: string;
    action: string;
}

export enum View {
  LANDING,
  VOTER_LOGIN,
  VOTER_REGISTER,
  VOTER_DASHBOARD,
  ADMIN_LOGIN,
  ADMIN_DASHBOARD
}
