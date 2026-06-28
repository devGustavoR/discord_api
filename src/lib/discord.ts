const BASE_URL = 'https://discord.com/api/v10'

const headers = {
  Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
  'Content-Type': 'application/json',
}

export const GUILD_ID = process.env.DISCORD_GUILD_ID!

export async function discordRequest(
  method: string,
  path: string,
  body?: unknown
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Discord API error: ${JSON.stringify(err)}`)
  }

  return res.status === 204 ? null : res.json()
}
