import { createClient } from 'redis'
import config from './env.js'

let redisClient: any = null

export async function initRedis() {
  if (redisClient) return redisClient

  redisClient = createClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  })

  redisClient.on('error', (err) => console.error('Redis error:', err))
  redisClient.on('connect', () => console.log('Redis connected'))
  redisClient.on('disconnect', () => console.log('Redis disconnected'))

  await redisClient.connect()
  return redisClient
}

export async function getRedis() {
  if (!redisClient) {
    await initRedis()
  }
  return redisClient
}

export default { initRedis, getRedis }
