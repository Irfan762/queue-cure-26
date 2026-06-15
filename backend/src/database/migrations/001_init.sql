-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create receptionists table
CREATE TABLE IF NOT EXISTS receptionists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clinic_id, email)
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  age INT,
  gender VARCHAR(1) CHECK (gender IN ('M', 'F', 'O')),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create queue_sessions table
CREATE TABLE IF NOT EXISTS queue_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  total_tokens INT DEFAULT 0,
  tokens_served INT DEFAULT 0,
  avg_consultation_time_minutes INT DEFAULT 15,
  session_start_time TIMESTAMP,
  session_end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clinic_id, session_date)
);

-- Create queue_tokens table
CREATE TABLE IF NOT EXISTS queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  session_id UUID REFERENCES queue_sessions(id) ON DELETE SET NULL,
  token_number BIGINT NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in_service', 'completed', 'no_show')),
  position_in_queue INT,
  estimated_wait_time_minutes INT,
  consultation_start_time TIMESTAMP,
  consultation_end_time TIMESTAMP,
  actual_wait_time_minutes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  called_at TIMESTAMP,
  served_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_clinics_status ON clinics(status);
CREATE INDEX idx_receptionists_clinic_id ON receptionists(clinic_id);
CREATE INDEX idx_receptionists_email ON receptionists(email);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_phone ON patients(clinic_id, phone);
CREATE INDEX idx_queue_sessions_clinic_date ON queue_sessions(clinic_id, session_date);
CREATE INDEX idx_queue_tokens_clinic_id ON queue_tokens(clinic_id);
CREATE INDEX idx_queue_tokens_status ON queue_tokens(clinic_id, status);
CREATE INDEX idx_queue_tokens_position ON queue_tokens(clinic_id, position_in_queue) WHERE status IN ('waiting', 'called');
CREATE INDEX idx_queue_tokens_token_number ON queue_tokens(clinic_id, token_number);
CREATE INDEX idx_queue_tokens_created_at ON queue_tokens(created_at DESC);
