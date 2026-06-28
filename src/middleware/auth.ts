import { createMiddleware } from 'hono/factory'

export const authMiddleware = createMiddleware(async (c, next) => {
  const apiKey = c.req.header('x-api-key')

  console.log(apiKey)
  console.log(process.env.API_KEY)
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
})
