const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const API_URL = process.env.API_URL!
const API_KEY = process.env.API_KEY!
const ALLOWED_USER_ID = Number(process.env.TELEGRAM_USER_ID!)

const TG = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`

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
  return res.status === 204 ? null : res.json()
}

async function handleCommand(chatId: number, text: string) {
  const [command, ...args] = text.trim().split(' ')

  switch (command) {
    // CARGOS
    case '/cargos': {
      const data = await callAPI('GET', '/api/roles')
      const list = data
        .filter((r: any) => !r.managed && r.name !== '@everyone')
        .map((r: any) => `• ${r.name} (${r.id})`)
        .join('\n')
      await sendMessage(chatId, `*Cargos do servidor:*\n${list}`)
      break
    }

    case '/criacargo': {
      // /criacargo Nome do Cargo #FF5733
      const color = args[args.length - 1].startsWith('#') ? args.pop() : undefined
      const name = args.join(' ')
      const data = await callAPI('POST', '/api/roles', { name, color })
      await sendMessage(chatId, `✅ Cargo *${data.name}* criado!`)
      break
    }

    case '/deletacargo': {
      // /deletacargo ROLE_ID
      const [roleId] = args
      await callAPI('DELETE', `/api/roles/${roleId}`)
      await sendMessage(chatId, `✅ Cargo deletado!`)
      break
    }

    case '/dacargo': {
      // /dacargo ROLE_ID USER_ID
      const [roleId, userId] = args
      await callAPI('PUT', `/api/roles/${roleId}/members/${userId}`)
      await sendMessage(chatId, `✅ Cargo dado ao membro!`)
      break
    }

    case '/removecargo': {
      // /removecargo ROLE_ID USER_ID
      const [roleId, userId] = args
      await callAPI('DELETE', `/api/roles/${roleId}/members/${userId}`)
      await sendMessage(chatId, `✅ Cargo removido do membro!`)
      break
    }

    // MEMBROS
    case '/bane': {
      // /bane USER_ID motivo aqui
      const [userId, ...reasonParts] = args
      const reason = reasonParts.join(' ') || 'Sem motivo informado'
      await callAPI('PUT', `/api/members/${userId}/ban`, { reason })
      await sendMessage(chatId, `✅ Membro banido! Motivo: ${reason}`)
      break
    }

    case '/desbane': {
      // /desbane USER_ID
      const [userId] = args
      await callAPI('DELETE', `/api/members/${userId}/ban`)
      await sendMessage(chatId, `✅ Membro desbanido!`)
      break
    }

    case '/kick': {
      // /kick USER_ID
      const [userId] = args
      await callAPI('DELETE', `/api/members/${userId}`)
      await sendMessage(chatId, `✅ Membro kickado!`)
      break
    }

    case '/silencia': {
      // /silencia USER_ID 10 (minutos)
      const [userId, minutes] = args
      await callAPI('POST', `/api/members/${userId}/timeout`, { minutes: Number(minutes) })
      await sendMessage(chatId, `✅ Membro silenciado por ${minutes} minutos!`)
      break
    }

    // MENSAGENS
    case '/avisa': {
      // /avisa CHANNEL_ID mensagem aqui
      const [channelId, ...msgParts] = args
      const content = msgParts.join(' ')
      await callAPI('POST', `/api/messages/${channelId}`, { content })
      await sendMessage(chatId, `✅ Mensagem enviada no canal!`)
      break
    }

    // CANAIS
    case '/canais': {
      const data = await callAPI('GET', '/api/channels')
      const list = data
        .filter((c: any) => c.type === 0) // só texto
        .map((c: any) => `• #${c.name} (${c.id})`)
        .join('\n')
      await sendMessage(chatId, `*Canais de texto:*\n${list}`)
      break
    }

    // AJUDA
    case '/ajuda': {
      await sendMessage(chatId, `*Comandos disponíveis:*

*Cargos*
/cargos — lista todos
/criacargo Nome #COR — cria cargo
/deletacargo ID — deleta cargo
/dacargo ROLE\\_ID USER\\_ID — dá cargo
/removecargo ROLE\\_ID USER\\_ID — remove cargo

*Membros*
/bane USER\\_ID motivo — bane membro
/desbane USER\\_ID — desbane
/kick USER\\_ID — kicka membro
/silencia USER\\_ID minutos — timeout

*Mensagens*
/avisa CHANNEL\\_ID mensagem — envia msg

*Canais*
/canais — lista canais de texto`)
      break
    }

    default:
      await sendMessage(chatId, `❓ Comando não reconhecido. Use /ajuda para ver os comandos.`)
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

        // Só aceita comandos do seu usuário
        if (msg.from.id !== ALLOWED_USER_ID) {
          await sendMessage(msg.chat.id, '⛔ Acesso negado.')
          continue
        }

        await handleCommand(msg.chat.id, msg.text).catch(async (err) => {
          await sendMessage(msg.chat.id, `❌ Erro: ${err.message}`)
        })
      }
    } catch (err) {
      console.error('Polling error:', err)
      await Bun.sleep(5000)
    }
  }
}

pollUpdates()