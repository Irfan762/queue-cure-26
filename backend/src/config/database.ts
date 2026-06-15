import pg from 'pg'
import config from './env.js'

const { Pool } = pg

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  min: config.db.min,
  max: config.db.max,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    if (duration > 1000) {
      console.warn('Long query detected:', { text, duration })
    }
    return result
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

export async function getClient() {
  return pool.connect()
}

export default pool
