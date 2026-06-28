import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authMiddleware } from './middleware/auth'
import { channels } from './routes/channels'
import { members } from './routes/members'
import { messages } from './routes/messages'
import { roles } from './routes/roles'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
}))
app.use('/api/*', authMiddleware)

app.get('/', (c) => c.json({ status: 'ok', name: 'Discord Manager API' }))

app.route('/api/roles', roles)
app.route('/api/channels', channels)
app.route('/api/members', members)
app.route('/api/messages', messages)

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}
