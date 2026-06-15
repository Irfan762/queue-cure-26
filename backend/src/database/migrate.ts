import { query, getClient } from '../config/database.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigrations() {
  try {
    console.log('Starting database migrations...')

    const migrationFile = path.join(__dirname, 'migrations', '001_init.sql')
    const sql = await fs.readFile(migrationFile, 'utf8')

    const statements = sql.split(';').filter((s) => s.trim())
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement)
      }
    }

    console.log('✅ Database migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()
