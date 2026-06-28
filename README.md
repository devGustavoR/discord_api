# Discord Manager API

API para gerenciar o servidor do Discord via n8n + Telegram.

## Setup

```bash
bun install
cp .env.example .env
# preenche o .env
bun dev
```

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `DISCORD_TOKEN` | Token do bot (Discord Developer Portal) |
| `DISCORD_GUILD_ID` | ID do servidor (clique direito no servidor → Copiar ID) |
| `API_KEY` | Chave secreta usada no header `x-api-key` pelo n8n |

## Autenticação

Todas as rotas `/api/*` exigem o header:
```
x-api-key: SUA_API_KEY
```

## Endpoints

### Cargos `/api/roles`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/roles` | Listar todos os cargos |
| POST | `/api/roles` | Criar cargo |
| PATCH | `/api/roles/:roleId` | Editar cargo |
| DELETE | `/api/roles/:roleId` | Deletar cargo |
| PUT | `/api/roles/:roleId/members/:userId` | Dar cargo a membro |
| DELETE | `/api/roles/:roleId/members/:userId` | Remover cargo de membro |

### Canais `/api/channels`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/channels` | Listar canais |
| POST | `/api/channels` | Criar canal |
| PATCH | `/api/channels/:channelId` | Editar canal |
| DELETE | `/api/channels/:channelId` | Deletar canal |

### Membros `/api/members`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/members/:userId` | Buscar membro |
| PATCH | `/api/members/:userId/nick` | Editar apelido |
| POST | `/api/members/:userId/timeout` | Silenciar (timeout) |
| DELETE | `/api/members/:userId/timeout` | Remover timeout |
| DELETE | `/api/members/:userId` | Kickar membro |
| PUT | `/api/members/:userId/ban` | Banir membro |
| DELETE | `/api/members/:userId/ban` | Desbanir membro |

### Mensagens `/api/messages`
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/messages/:channelId` | Enviar mensagem |
| DELETE | `/api/messages/:channelId/:messageId` | Deletar mensagem |
| PUT | `/api/messages/:channelId/:messageId/pin` | Fixar mensagem |

## Exemplos

### Criar cargo
```json
POST /api/roles
{
  "name": "Player de LoL",
  "color": "#5865F2",
  "hoist": false,
  "mentionable": true
}
```

### Enviar mensagem em canal
```json
POST /api/messages/ID_DO_CANAL
{
  "content": "Aviso importante! @everyone"
}
```

### Silenciar membro por 10 minutos
```json
POST /api/members/ID_DO_USUARIO/timeout
{
  "minutes": 10
}
```

## Deploy no Railway

1. Sobe o projeto no GitHub
2. Cria novo projeto no Railway → Deploy from GitHub
3. Adiciona as variáveis de ambiente no painel
4. Railway detecta Bun automaticamente pelo `package.json`
