export interface Patient {
  id: string;
  name: string;
  phone?: string;
  age?: number;
  gender?: 'M' | 'F' | 'O';
}

export interface QueueToken {
  id: string;
  clinicId: string;
  tokenNumber: number;
  patientId?: string;
  patientName: string;
  status: 'waiting' | 'called' | 'in_service' | 'completed' | 'no_show';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  positionInQueue: number;
  estimatedWaitTimeMinutes: number;
  createdAt: string;
  calledAt?: string;
  completedAt?: string;
}

export interface QueueSession {
  id: string;
  clinicId: string;
  sessionDate: string;
  status: 'active' | 'paused' | 'closed';
  totalTokens: number;
  tokensServed: number;
  avgConsultationTimeMinutes: number;
}

export interface Clinic {
  id: string;
  name: string;
  location?: string;
  phone?: string;
  email?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  clinicId: string;
  role: 'receptionist' | 'admin';
}

export interface QueueState {
  currentToken: QueueToken | null;
  waitingTokens: QueueToken[];
  avgConsultationTime: number;
  queueLength: number;
  lastUpdate: number;
}

export interface SocketError {
  message: string;
  code?: string;
}
