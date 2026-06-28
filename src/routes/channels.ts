import { Hono } from 'hono'
import { discordRequest, GUILD_ID } from '../lib/discord'

export const channels = new Hono()

// Listar canais
channels.get('/', async (c) => {
  const data = await discordRequest('GET', `/guilds/${GUILD_ID}/channels`)
  return c.json(data)
})

// Criar canal
channels.post('/', async (c) => {
  const body = await c.req.json()
  // type: 0 = texto, 2 = voz, 4 = categoria
  const data = await discordRequest('POST', `/guilds/${GUILD_ID}/channels`, body)
  return c.json(data, 201)
})

// Editar canal
channels.patch('/:channelId', async (c) => {
  const { channelId } = c.req.param()
  const body = await c.req.json()
  const data = await discordRequest('PATCH', `/channels/${channelId}`, body)
  return c.json(data)
})

// Deletar canal
channels.delete('/:channelId', async (c) => {
  const { channelId } = c.req.param()
  await discordRequest('DELETE', `/channels/${channelId}`)
  return c.json({ success: true })
})
