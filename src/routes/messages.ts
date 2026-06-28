import { Hono } from 'hono'
import { discordRequest } from '../lib/discord'

export const messages = new Hono()

// Enviar mensagem em canal
messages.post('/:channelId', async (c) => {
  const { channelId } = c.req.param()
  const { content, embeds } = await c.req.json()
  const data = await discordRequest('POST', `/channels/${channelId}/messages`, {
    content,
    embeds,
  })
  return c.json(data, 201)
})

// Deletar mensagem
messages.delete('/:channelId/:messageId', async (c) => {
  const { channelId, messageId } = c.req.param()
  await discordRequest('DELETE', `/channels/${channelId}/messages/${messageId}`)
  return c.json({ success: true })
})

// Fixar mensagem
messages.put('/:channelId/:messageId/pin', async (c) => {
  const { channelId, messageId } = c.req.param()
  await discordRequest('PUT', `/channels/${channelId}/pins/${messageId}`)
  return c.json({ success: true })
})
