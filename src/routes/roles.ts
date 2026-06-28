import { Hono } from 'hono'
import z from 'zod'
import { discordRequest, GUILD_ID } from '../lib/discord'

export const roles = new Hono()

const roleBodyValidator = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.string().default('000000'),
  hoist: z.boolean().default(false),
  mentionable: z.boolean().default(false),
})

// Listar todos os cargos
roles.get('/', async (c) => {
  const data = await discordRequest('GET', `/guilds/${GUILD_ID}/roles`)
  return c.json(data)
})

// Criar cargo
roles.post('/', async (c) => {
  const body = await roleBodyValidator.parseAsync(await c.req.json())

  const data = await discordRequest('POST', `/guilds/${GUILD_ID}/roles`, {
    ...body,
    color: body.color ? parseInt(body.color.replace('#', ''), 16) : 0,
  })
  return c.json(data, 201)
})

// Editar cargo
roles.patch('/:roleId', async (c) => {
  const { roleId } = c.req.param()
  const body = await c.req.json()
  if (body.color) body.color = parseInt(body.color.replace('#', ''), 16)
  const data = await discordRequest('PATCH', `/guilds/${GUILD_ID}/roles/${roleId}`, body)
  return c.json(data)
})

// Deletar cargo
roles.delete('/:roleId', async (c) => {
  const { roleId } = c.req.param()
  await discordRequest('DELETE', `/guilds/${GUILD_ID}/roles/${roleId}`)
  return c.json({ success: true })
})

// Dar cargo a membro
roles.put('/:roleId/members/:userId', async (c) => {
  const { roleId, userId } = c.req.param()
  await discordRequest('PUT', `/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`)
  return c.json({ success: true })
})

// Remover cargo de membro
roles.delete('/:roleId/members/:userId', async (c) => {
  const { roleId, userId } = c.req.param()
  await discordRequest('DELETE', `/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`)
  return c.json({ success: true })
})
