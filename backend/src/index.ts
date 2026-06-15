import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import config from './config/env.js'
import { query } from './config/database.js'
import { initRedis } from './config/redis.js'
import { v4 as uuidv4 } from 'uuid'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: config.socket.corsOrigin,
    methods: ['GET', 'POST'],
  },
  path: config.socket.path,
})

// Middleware
app.use(helmet())
app.use(cors({ origin: config.cors.origin }))
app.use(express.json())

// Middleware for token verification
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth Routes
app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const result = await query(
      `SELECT r.*, c.name as clinic_name FROM receptionists r
       JOIN clinics c ON r.clinic_id = c.id
       WHERE r.email = $1 AND r.status = 'active'`,
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const receptionist = result.rows[0]
    const isPasswordValid = await bcryptjs.compare(password, receptionist.password_hash)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      {
        id: receptionist.id,
        email: receptionist.email,
        name: receptionist.name,
        clinicId: receptionist.clinic_id,
        role: 'receptionist',
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiry }
    )

    res.json({
      token,
      user: {
        id: receptionist.id,
        email: receptionist.email,
        name: receptionist.name,
        clinicId: receptionist.clinic_id,
        role: 'receptionist',
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Queue Routes
app.post('/api/queue/add-patient', verifyToken, async (req: any, res: any) => {
  try {
    const { clinicId, patientName, phone, priority = 'normal' } = req.body

    if (!clinicId || !patientName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const client = await (await import('./config/database.js')).getClient()

    try {
      await client.query('BEGIN')

      // Get current session
      const sessionResult = await client.query(
        `SELECT id, total_tokens FROM queue_sessions
         WHERE clinic_id = $1 AND session_date = CURRENT_DATE AND status = 'active'
         LIMIT 1`,
        [clinicId]
      )

      if (sessionResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: 'No active session' })
      }

      const session = sessionResult.rows[0]
      const nextTokenNumber = session.total_tokens + 1

      // Create patient
      const patientResult = await client.query(
        `INSERT INTO patients (clinic_id, name, phone, status) VALUES ($1, $2, $3, $4) RETURNING id`,
        [clinicId, patientName, phone, 'active']
      )

      const patientId = patientResult.rows[0].id

      // Create token
      const tokenResult = await client.query(
        `INSERT INTO queue_tokens (
          clinic_id, session_id, token_number, patient_id, patient_name, phone,
          priority, status, position_in_queue, estimated_wait_time_minutes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          clinicId,
          session.id,
          nextTokenNumber,
          patientId,
          patientName,
          phone,
          priority,
          'waiting',
          nextTokenNumber,
          (nextTokenNumber - 1) * 15,
        ]
      )

      // Update session
      await client.query(`UPDATE queue_sessions SET total_tokens = $1 WHERE id = $2`, [
        nextTokenNumber,
        session.id,
      ])

      await client.query('COMMIT')

      const token = tokenResult.rows[0]
      io.to(`clinic-${clinicId}`).emit('queue:updated', {
        event: 'patient_added',
        tokenNumber: token.token_number,
        queueLength: nextTokenNumber,
      })

      res.status(201).json({
        id: token.id,
        tokenNumber: token.token_number,
        patientName: token.patient_name,
        status: token.status,
        priority: token.priority,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Add patient error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/queue/call-next', verifyToken, async (req: any, res: any) => {
  try {
    const { clinicId } = req.body

    if (!clinicId) {
      return res.status(400).json({ error: 'Clinic ID required' })
    }

    const client = await (await import('./config/database.js')).getClient()

    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE')

      // Get next waiting token with lock
      const tokenResult = await client.query(
        `SELECT id, token_number FROM queue_tokens
         WHERE clinic_id = $1 AND status = 'waiting'
         ORDER BY priority DESC, created_at ASC
         LIMIT 1
         FOR UPDATE`,
        [clinicId]
      )

      if (tokenResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(409).json({ error: 'No tokens available' })
      }

      const token = tokenResult.rows[0]

      // Update token status
      await client.query(
        `UPDATE queue_tokens SET status = 'called', called_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [token.id]
      )

      await client.query('COMMIT')

      io.to(`clinic-${clinicId}`).emit('queue:token-called', {
        tokenId: token.id,
        tokenNumber: token.token_number,
        timestamp: new Date(),
      })

      res.json({
        tokenId: token.id,
        tokenNumber: token.token_number,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Call next error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/queue/current-state', verifyToken, async (req: any, res: any) => {
  try {
    const { clinicId } = req.query

    if (!clinicId) {
      return res.status(400).json({ error: 'Clinic ID required' })
    }

    // Get current token
    const currentResult = await query(
      `SELECT * FROM queue_tokens WHERE clinic_id = $1 AND status = 'called' ORDER BY called_at DESC LIMIT 1`,
      [clinicId]
    )

    // Get waiting tokens
    const waitingResult = await query(
      `SELECT * FROM queue_tokens WHERE clinic_id = $1 AND status = 'waiting' ORDER BY priority DESC, created_at ASC`,
      [clinicId]
    )

    // Get session info
    const sessionResult = await query(
      `SELECT avg_consultation_time_minutes FROM queue_sessions WHERE clinic_id = $1 AND session_date = CURRENT_DATE LIMIT 1`,
      [clinicId]
    )

    res.json({
      currentToken: currentResult.rows[0] || null,
      waitingTokens: waitingResult.rows,
      avgConsultationTime: sessionResult.rows[0]?.avg_consultation_time_minutes || 15,
      queueLength: waitingResult.rows.length,
    })
  } catch (error) {
    console.error('Get state error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/queue/patient-info', async (req: any, res: any) => {
  try {
    const { clinicId, tokenNumber } = req.query

    if (!clinicId || !tokenNumber) {
      return res.status(400).json({ error: 'Clinic ID and token number required' })
    }

    const tokenResult = await query(
      `SELECT * FROM queue_tokens WHERE clinic_id = $1 AND token_number = $2 LIMIT 1`,
      [clinicId, parseInt(tokenNumber)]
    )

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({ error: 'Token not found' })
    }

    const token = tokenResult.rows[0]

    const currentResult = await query(
      `SELECT token_number FROM queue_tokens WHERE clinic_id = $1 AND status = 'called' LIMIT 1`,
      [clinicId]
    )

    const sessionResult = await query(
      `SELECT avg_consultation_time_minutes FROM queue_sessions WHERE clinic_id = $1 AND session_date = CURRENT_DATE LIMIT 1`,
      [clinicId]
    )

    const aheadResult = await query(
      `SELECT COUNT(*) as count FROM queue_tokens WHERE clinic_id = $1 AND position_in_queue < $2 AND status = 'waiting'`,
      [clinicId, token.position_in_queue]
    )

    res.json({
      currentTokenNumber: currentResult.rows[0]?.token_number || null,
      patientPosition: token.position_in_queue,
      tokensAhead: aheadResult.rows[0].count,
      estimatedWaitTime: token.estimated_wait_time_minutes,
      avgConsultationTime: sessionResult.rows[0]?.avg_consultation_time_minutes || 15,
    })
  } catch (error) {
    console.error('Patient info error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/queue/set-avg-time', verifyToken, async (req: any, res: any) => {
  try {
    const { clinicId, avgConsultationTimeMinutes } = req.body

    if (!clinicId || !avgConsultationTimeMinutes) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    await query(
      `UPDATE queue_sessions SET avg_consultation_time_minutes = $1 WHERE clinic_id = $2 AND session_date = CURRENT_DATE`,
      [avgConsultationTimeMinutes, clinicId]
    )

    io.to(`clinic-${clinicId}`).emit('queue:avg-time-updated', { avgConsultationTimeMinutes })

    res.json({ avgConsultationTimeMinutes })
  } catch (error) {
    console.error('Set avg time error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Socket.IO
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('queue:join-clinic', (data) => {
    socket.join(`clinic-${data.clinicId}`)
    console.log(`Socket joined clinic: ${data.clinicId}`)
  })

  socket.on('queue:leave-clinic', (data) => {
    socket.leave(`clinic-${data.clinicId}`)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

// Start server
const PORT = config.port
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Queue Cure '26 Backend running at http://0.0.0.0:${PORT}`)
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`)
  console.log(`🔌 Socket.IO path: ${config.socket.path}`)
  console.log(`\n📝 Environment: ${config.env}`)
  console.log(`🗄️  Database: ${config.db.host}:${config.db.port}/${config.db.database}`)
})

export default app
