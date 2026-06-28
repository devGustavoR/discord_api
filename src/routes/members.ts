import { Hono } from 'hono'
import { discordRequest, GUILD_ID } from '../lib/discord'

export const members = new Hono()

// Buscar membro
members.get('/:userId', async (c) => {
  const { userId } = c.req.param()
  const data = await discordRequest('GET', `/guilds/${GUILD_ID}/members/${userId}`)
  return c.json(data)
})

// Editar apelido
members.patch('/:userId/nick', async (c) => {
  const { userId } = c.req.param()
  const { nick } = await c.req.json()
  await discordRequest('PATCH', `/guilds/${GUILD_ID}/members/${userId}`, { nick })
  return c.json({ success: true })
})

// Silenciar membro (timeout)
members.post('/:userId/timeout', async (c) => {
  const { userId } = c.req.param()
  const { minutes } = await c.req.json()
  const until = new Date(Date.now() + minutes * 60 * 1000).toISOString()
  await discordRequest('PATCH', `/guilds/${GUILD_ID}/members/${userId}`, {
    communication_disabled_until: until,
  })
  return c.json({ success: true, until })
})

// Remover timeout
members.delete('/:userId/timeout', async (c) => {
  const { userId } = c.req.param()
  await discordRequest('PATCH', `/guilds/${GUILD_ID}/members/${userId}`, {
    communication_disabled_until: null,
  })
  return c.json({ success: true })
})

// Kickar membro
members.delete('/:userId', async (c) => {
  const { userId } = c.req.param()
  await discordRequest('DELETE', `/guilds/${GUILD_ID}/members/${userId}`)
  return c.json({ success: true })
})

// Banir membro
members.put('/:userId/ban', async (c) => {
  const { userId } = c.req.param()
  const { reason, delete_message_days } = await c.req.json().catch(() => ({}))
  await discordRequest('PUT', `/guilds/${GUILD_ID}/bans/${userId}`, {
    reason,
    delete_message_seconds: (delete_message_days ?? 1) * 86400,
  })
  return c.json({ success: true })
})

// Desbanir membro
members.delete('/:userId/ban', async (c) => {
  const { userId } = c.req.param()
  await discordRequest('DELETE', `/guilds/${GUILD_ID}/bans/${userId}`)
  return c.json({ success: true })
})
