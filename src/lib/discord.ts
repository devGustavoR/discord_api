const BASE_URL = 'https://discord.com/api/v10'

const headers = {
  Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
  'Content-Type': 'application/json',
}

export const GUILD_ID = process.env.DISCORD_GUILD_ID!

const DISCORD_ERRORS: Record<number, string> = {
  10011: 'Cargo não encontrado',
  10007: 'Membro não encontrado no servidor',
  10013: 'Usuário não encontrado',
  10003: 'Canal não encontrado',
  50013: 'Bot sem permissão para realizar essa ação',
  50028: 'Não é possível editar um cargo gerenciado por integração',
  50035: 'Dados inválidos enviados ao Discord',
  50001: 'Acesso negado',
  40005: 'Arquivo muito grande',
  30005: 'Limite máximo de cargos atingido',
}

export class DiscordAPIError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function discordRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any
    const friendly = DISCORD_ERRORS[err?.code] ?? err?.message ?? 'Erro desconhecido do Discord'
    throw new DiscordAPIError(friendly, res.status >= 500 ? 502 : res.status)
  }

  return res.status === 204 ? null : res.json()
}
