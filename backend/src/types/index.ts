export interface Patient {
  id: string
  clinicId: string
  name: string
  phone?: string
  age?: number
  gender?: 'M' | 'F' | 'O'
  createdAt: Date
  updatedAt: Date
}

export interface QueueToken {
  id: string
  clinicId: string
  tokenNumber: number
  patientId?: string
  patientName: string
  status: 'waiting' | 'called' | 'in_service' | 'completed' | 'no_show'
  priority: 'urgent' | 'high' | 'normal' | 'low'
  positionInQueue: number
  estimatedWaitTimeMinutes: number
  createdAt: Date
  calledAt?: Date
  completedAt?: Date
  consultationStartTime?: Date
  consultationEndTime?: Date
  actualWaitTimeMinutes?: number
}

export interface QueueSession {
  id: string
  clinicId: string
  sessionDate: Date
  status: 'active' | 'paused' | 'closed'
  totalTokens: number
  tokensServed: number
  avgConsultationTimeMinutes: number
  createdAt: Date
  updatedAt: Date
}

export interface Clinic {
  id: string
  name: string
  location?: string
  phone?: string
  email?: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface Receptionist {
  id: string
  clinicId: string
  name: string
  email: string
  passwordHash: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}
