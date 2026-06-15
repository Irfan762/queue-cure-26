import { query } from '../config/database.js'
import bcryptjs from 'bcryptjs'

async function seedDatabase() {
  try {
    console.log('Starting database seeding...')

    // Create a clinic
    const clinicResult = await query(
      `INSERT INTO clinics (name, location, phone, email, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['Demo Clinic', 'New York, NY', '+1-555-0001', 'admin@democlinic.com', 'active']
    )

    const clinicId = clinicResult.rows[0].id
    console.log('✅ Created clinic:', clinicId)

    // Create a receptionist
    const passwordHash = await bcryptjs.hash('password123', 10)
    const receptionistResult = await query(
      `INSERT INTO receptionists (clinic_id, name, email, password_hash, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [clinicId, 'John Receptionist', 'receptionist@democlinic.com', passwordHash, 'active']
    )

    console.log('✅ Created receptionist:', receptionistResult.rows[0].id)

    // Create today's session
    const sessionResult = await query(
      `INSERT INTO queue_sessions (clinic_id, session_date, status, avg_consultation_time_minutes, session_start_time)
       VALUES ($1, CURRENT_DATE, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id`,
      [clinicId, 'active', 15]
    )

    const sessionId = sessionResult.rows[0].id
    console.log('✅ Created queue session:', sessionId)

    // Create sample patients
    const patients = [
      { name: 'Rajesh Patel', phone: '9876543210', age: 45, gender: 'M' },
      { name: 'Priya Singh', phone: '9876543211', age: 32, gender: 'F' },
      { name: 'Amit Kumar', phone: '9876543212', age: 28, gender: 'M' },
      { name: 'Neha Sharma', phone: '9876543213', age: 35, gender: 'F' },
      { name: 'Suresh Gupta', phone: '9876543214', age: 52, gender: 'M' },
    ]

    let tokenNumber = 1
    for (const patient of patients) {
      const patientResult = await query(
        `INSERT INTO patients (clinic_id, name, phone, age, gender, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [clinicId, patient.name, patient.phone, patient.age, patient.gender, 'active']
      )

      const patientId = patientResult.rows[0].id

      // Create queue tokens
      const priority = tokenNumber === 1 ? 'high' : 'normal'
      const status = tokenNumber === 1 ? 'called' : 'waiting'
      const positionInQueue = status === 'called' ? 0 : tokenNumber - 1

      await query(
        `INSERT INTO queue_tokens (
          clinic_id, session_id, token_number, patient_id, patient_name, phone,
          priority, status, position_in_queue, estimated_wait_time_minutes,
          consultation_start_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [
          clinicId,
          sessionId,
          tokenNumber,
          patientId,
          patient.name,
          patient.phone,
          priority,
          status,
          positionInQueue,
          (tokenNumber - 1) * 15,
          status === 'called' ? new Date() : null,
        ]
      )

      console.log(`✅ Created patient and token: ${patient.name} (Token #${tokenNumber})`)
      tokenNumber++
    }

    // Update session total tokens
    await query(
      `UPDATE queue_sessions SET total_tokens = $1 WHERE id = $2`,
      [patients.length, sessionId]
    )

    console.log('\n✅ Database seeding completed successfully!')
    console.log('\nDemo Credentials:')
    console.log('Email: receptionist@democlinic.com')
    console.log('Password: password123')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
