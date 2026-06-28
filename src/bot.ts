const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const API_URL = process.env.API_URL!
const API_KEY = process.env.API_KEY!
const ALLOWED_USER_ID = Number(process.env.TELEGRAM_USER_ID!)

const TG = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function typing(chatId: number) {
  await fetch(`${TG}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  })
}

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TG}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  })
}

async function callAPI(method: string, path: string, body?: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({})) as any
    throw new Error(err?.message || `HTTP ${res.status} em ${method} ${path}`)
  }
  return res.status === 204 ? null : res.json()
}

async function handleCommand(chatId: number, text: string) {
  const [command, ...args] = text.trim().split(' ')

  await typing(chatId)

  switch (command) {
    // ── CARGOS ──────────────────────────────────────────────
    case '/cargos': {
      const data = await callAPI('GET', '/api/roles')
      const roles = data.filter((r: any) => !r.managed && r.name !== '@everyone')
      const list = roles.map((r: any) => `• *${r.name}* \`${r.id}\``).join('\n')
      await sendMessage(chatId, `🏷️ *${roles.length} cargo(s) no servidor:*\n\n${list}`)
      break
    }

    case '/criacargo': {
      // /criacargo Nome do Cargo #FF5733
      const color = args[args.length - 1]?.startsWith('#') ? args.pop() : undefined
      const name = args.join(' ')
      if (!name) { await sendMessage(chatId, `⚠️ Faltou o nome do cargo!\nEx: /criacargo Moderador #FF5733`); break }
      const data = await callAPI('POST', '/api/roles', { name, color })
      await sendMessage(chatId, pick([
        `🎨 Cargo *${data.name}* criado!${color ? ` Cor: ${color}` : ''}`,
        `✅ *${data.name}* tá no ar!${color ? ` (${color})` : ''}`,
      ]))
      break
    }

    case '/deletacargo': {
      // /deletacargo ROLE_ID
      const [roleId] = args
      if (!roleId) { await sendMessage(chatId, `⚠️ Faltou o ID do cargo!\nEx: /deletacargo 123456789`); break }
      await callAPI('DELETE', `/api/roles/${roleId}`)
      await sendMessage(chatId, pick([
        `🗑️ Cargo deletado. Nem deixou saudade!`,
        `💨 Cargo mandado embora com sucesso.`,
      ]))
      break
    }

    case '/dacargo': {
      // /dacargo ROLE_ID USER_ID
      const [roleId, userId] = args
      if (!roleId || !userId) { await sendMessage(chatId, `⚠️ Uso: /dacargo ROLE_ID USER_ID`); break }
      await callAPI('PUT', `/api/roles/${roleId}/members/${userId}`)
      await sendMessage(chatId, pick([
        `👑 Promovido! Cargo concedido ao membro.`,
        `🎖️ Cargo dado. Glória ao novo portador!`,
      ]))
      break
    }

    case '/removecargo': {
      // /removecargo ROLE_ID USER_ID
      const [roleId, userId] = args
      if (!roleId || !userId) { await sendMessage(chatId, `⚠️ Uso: /removecargo ROLE_ID USER_ID`); break }
      await callAPI('DELETE', `/api/roles/${roleId}/members/${userId}`)
      await sendMessage(chatId, pick([
        `✂️ Cargo removido. Vida que segue!`,
        `📉 Membro rebaixado. Cargo retirado.`,
      ]))
      break
    }

    // ── MEMBROS ─────────────────────────────────────────────
    case '/membro': {
      // /membro USER_ID
      const [userId] = args
      if (!userId) { await sendMessage(chatId, `⚠️ Faltou o ID!\nEx: /membro 123456789`); break }
      const data = await callAPI('GET', `/api/members/${userId}`)
      const nick = data.nick || data.user?.username || 'sem apelido'
      const tag = data.user?.discriminator && data.user.discriminator !== '0' ? `#${data.user.discriminator}` : ''
      const joined = data.joined_at ? new Date(data.joined_at).toLocaleDateString('pt-BR') : '?'
      const roleCount = data.roles?.length ?? 0
      await sendMessage(chatId,
        `👤 *${nick}${tag}*\n\n` +
        `📅 No servidor desde: *${joined}*\n` +
        `🎭 Cargos: *${roleCount}* cargo(s)\n` +
        `🆔 ID: \`${userId}\``
      )
      break
    }

    case '/nick': {
      // /nick USER_ID novo apelido aqui
      const [userId, ...nickParts] = args
      const nick = nickParts.join(' ')
      if (!userId || !nick) { await sendMessage(chatId, `⚠️ Uso: /nick USER_ID novo apelido`); break }
      await callAPI('PATCH', `/api/members/${userId}/nick`, { nick })
      await sendMessage(chatId, pick([
        `✏️ Apelido atualizado para *${nick}*!`,
        `📝 Nome trocado! Agora é *${nick}*.`,
      ]))
      break
    }

    case '/bane': {
      // /bane USER_ID motivo aqui
      const [userId, ...reasonParts] = args
      if (!userId) { await sendMessage(chatId, `⚠️ Uso: /bane USER_ID motivo`); break }
      const reason = reasonParts.join(' ') || 'Sem motivo informado'
      await callAPI('PUT', `/api/members/${userId}/ban`, { reason })
      await sendMessage(chatId,
        `🔨 *BANIDO!*\n\n` +
        `🆔 \`${userId}\`\n` +
        `📋 Motivo: _${reason}_\n\n` +
        `_Tchau tchau. Não vai sentir falta._`
      )
      break
    }

    case '/desbane': {
      // /desbane USER_ID
      const [userId] = args
      if (!userId) { await sendMessage(chatId, `⚠️ Uso: /desbane USER_ID`); break }
      await callAPI('DELETE', `/api/members/${userId}/ban`)
      await sendMessage(chatId, pick([
        `🕊️ Desbanido. Seja bem-vindo de volta — dessa vez se comporta!`,
        `🔓 Ban levantado. O membro pode voltar ao servidor.`,
      ]))
      break
    }

    case '/kick': {
      // /kick USER_ID
      const [userId] = args
      if (!userId) { await sendMessage(chatId, `⚠️ Uso: /kick USER_ID`); break }
      await callAPI('DELETE', `/api/members/${userId}`)
      await sendMessage(chatId, pick([
        `🥾 Kickado! \`${userId}\` saiu voando.`,
        `👋 Tchau! Membro removido do servidor.`,
      ]))
      break
    }

    case '/silencia': {
      // /silencia USER_ID 10 (minutos)
      const [userId, minutes] = args
      if (!userId || !minutes) { await sendMessage(chatId, `⚠️ Uso: /silencia USER_ID minutos`); break }
      await callAPI('POST', `/api/members/${userId}/timeout`, { minutes: Number(minutes) })
      const humanTime = Number(minutes) >= 60
        ? `${Math.floor(Number(minutes) / 60)}h${Number(minutes) % 60 > 0 ? Number(minutes) % 60 + 'min' : ''}`
        : `${minutes} minuto(s)`
      await sendMessage(chatId, pick([
        `🔇 Silenciado por *${humanTime}*. Paz reina no servidor! 🧘`,
        `🤐 Membro no mudo por *${humanTime}*. Sossego garantido.`,
      ]))
      break
    }

    case '/descilencia': {
      // /descilencia USER_ID
      const [userId] = args
      if (!userId) { await sendMessage(chatId, `⚠️ Uso: /descilencia USER_ID`); break }
      await callAPI('DELETE', `/api/members/${userId}/timeout`)
      await sendMessage(chatId, pick([
        `🔊 Timeout removido. O membro pode falar de novo — vai com calma!`,
        `🗣️ Liberado! Membro saiu do silêncio.`,
      ]))
      break
    }

    // ── MENSAGENS ───────────────────────────────────────────
    case '/avisa': {
      // /avisa CHANNEL_ID mensagem aqui
      const [channelId, ...msgParts] = args
      const content = msgParts.join(' ')
      if (!channelId || !content) { await sendMessage(chatId, `⚠️ Uso: /avisa CHANNEL_ID mensagem`); break }
      await callAPI('POST', `/api/messages/${channelId}`, { content })
      await sendMessage(chatId, pick([
        `📢 Aviso enviado no canal! Todo mundo vai ver.`,
        `✅ Mensagem publicada com sucesso!`,
      ]))
      break
    }

    case '/fixar': {
      // /fixar CHANNEL_ID MESSAGE_ID
      const [channelId, messageId] = args
      if (!channelId || !messageId) { await sendMessage(chatId, `⚠️ Uso: /fixar CHANNEL_ID MESSAGE_ID`); break }
      await callAPI('PUT', `/api/messages/${channelId}/${messageId}/pin`)
      await sendMessage(chatId, `📌 Mensagem fixada! Agora ninguém vai perder.`)
      break
    }

    case '/delmsg': {
      // /delmsg CHANNEL_ID MESSAGE_ID
      const [channelId, messageId] = args
      if (!channelId || !messageId) { await sendMessage(chatId, `⚠️ Uso: /delmsg CHANNEL_ID MESSAGE_ID`); break }
      await callAPI('DELETE', `/api/messages/${channelId}/${messageId}`)
      await sendMessage(chatId, `🗑️ Mensagem deletada. Como se nunca tivesse existido.`)
      break
    }

    // ── CANAIS ──────────────────────────────────────────────
    case '/canais': {
      const data = await callAPI('GET', '/api/channels')
      const canais = data.filter((c: any) => c.type === 0)
      const list = canais.map((c: any) => `• #${c.name} \`${c.id}\``).join('\n')
      await sendMessage(chatId, `💬 *${canais.length} canal(is) de texto:*\n\n${list}`)
      break
    }

    case '/criacanal': {
      // /criacanal nome-do-canal
      const [name] = args
      if (!name) { await sendMessage(chatId, `⚠️ Faltou o nome!\nEx: /criacanal geral`); break }
      const data = await callAPI('POST', '/api/channels', { name })
      await sendMessage(chatId, `✅ Canal *#${data.name}* criado!\n🆔 \`${data.id}\``)
      break
    }

    case '/deletacanal': {
      // /deletacanal CHANNEL_ID
      const [channelId] = args
      if (!channelId) { await sendMessage(chatId, `⚠️ Uso: /deletacanal CHANNEL_ID`); break }
      await callAPI('DELETE', `/api/channels/${channelId}`)
      await sendMessage(chatId, `🗑️ Canal deletado. Era hora!`)
      break
    }

    // ── SORTEIO ─────────────────────────────────────────────
    case '/srt': {
      // /srt item1 item2 item3 ...
      if (args.length < 2) {
        await sendMessage(chatId, `⚠️ Coloca pelo menos 2 opções!\nEx: /srt Gustavo Ana Pedro`)
        break
      }
      await sendMessage(chatId, `🎰 Girando a roleta entre *${args.length}* opções\\.\\.\\.`)
      await Bun.sleep(1200)
      await typing(chatId)
      await Bun.sleep(800)
      const winner = args[Math.floor(Math.random() * args.length)]
      await sendMessage(chatId, `🏆 *E o vencedor é\\.\\.\\.*\n\n✨ *${winner}* ✨\n\n_Não tem apelação não!_`)
      break
    }

    // ── STATUS ──────────────────────────────────────────────
    case '/ping': {
      const start = Date.now()
      await callAPI('GET', '/api/roles')
      const ms = Date.now() - start
      const status = ms < 300 ? '🟢' : ms < 800 ? '🟡' : '🔴'
      await sendMessage(chatId, `${status} *API respondendo!*\n⚡ Latência: *${ms}ms*`)
      break
    }

    // ── AJUDA ───────────────────────────────────────────────
    case '/start':
    case '/ajuda': {
      await sendMessage(chatId, `🤖 *Olá\\! Sou seu gerente do Discord via Telegram\\.*

🏷️ *Cargos*
/cargos — lista todos
/criacargo Nome \\#COR — cria cargo
/deletacargo ID — deleta cargo
/dacargo ROLE\\_ID USER\\_ID — dá cargo
/removecargo ROLE\\_ID USER\\_ID — remove cargo

👤 *Membros*
/membro USER\\_ID — info do membro
/nick USER\\_ID apelido — edita apelido
/bane USER\\_ID motivo — bane
/desbane USER\\_ID — remove ban
/kick USER\\_ID — kicka
/silencia USER\\_ID minutos — timeout
/descilencia USER\\_ID — remove timeout

💬 *Canais*
/canais — lista canais de texto
/criacanal nome — cria canal
/deletacanal ID — deleta canal

📢 *Mensagens*
/avisa CHANNEL\\_ID msg — envia mensagem
/fixar CHANNEL\\_ID MSG\\_ID — fixa mensagem
/delmsg CHANNEL\\_ID MSG\\_ID — deleta mensagem

🎲 *Extras*
/srt op1 op2 op3\\.\\.\\. — sorteio
/ping — checa latência da API`)
      break
    }

    default:
      await sendMessage(chatId, pick([
        `❓ Não conheço esse comando\\. Use /ajuda pra ver o que eu sei fazer\\.`,
        `🤔 Isso não é um comando válido\\. /ajuda tá aí pra algo!`,
      ]))
  }
}

async function pollUpdates() {
  let offset = 0

  console.log('🤖 Bot do Telegram iniciado!')

  while (true) {
    try {
      const res = await fetch(`${TG}/getUpdates?offset=${offset}&timeout=30`)
      const data = await res.json() as any

      for (const update of data.result ?? []) {
        offset = update.update_id + 1
        const msg = update.message
        if (!msg?.text) continue

        if (msg.from.id !== ALLOWED_USER_ID) {
          await sendMessage(msg.chat.id, '⛔ Acesso negado\\.')
          continue
        }

        await handleCommand(msg.chat.id, msg.text).catch(async (err) => {
          await sendMessage(msg.chat.id, `❌ *Erro:* _${err.message}_`)
        })
      }
    } catch (err) {
      console.error('Polling error:', err)
      await Bun.sleep(5000)
    }
  }
}

pollUpdates()
