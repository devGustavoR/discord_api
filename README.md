<div align="center">
<img src="https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif" width=65>
</div>

<h1 align="center">Discord Manager API 🤖</h1>

<div align="center">

API para gerenciar um servidor do Discord via **n8n + Telegram**, sem precisar abrir o Discord.

</div>

---

### 📖 Sobre

API REST construída com **Bun + Hono** que expõe rotas autenticadas para controlar seu servidor Discord — cargos, canais, membros e mensagens — podendo ser integrada facilmente com automações no n8n ou qualquer outra ferramenta de workflow.

---

### 🚀 Tecnologias utilizadas

- [Bun](https://bun.sh)
- [Hono](https://hono.dev)
- [Discord.js](https://discord.js.org)

---

### Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:
[Git](https://git-scm.com), [Bun](https://bun.sh).
Além disto é bom ter um editor como [VSCode](https://code.visualstudio.com/).

Você também precisa de um **bot criado no [Discord Developer Portal](https://discord.com/developers/applications)** com as permissões necessárias e adicionado ao seu servidor.

---

### 🎲 Rodando o projeto

```bash
# Clone este repositório
$ git clone https://github.com/devGustavoR/discord-manager

# Acesse a pasta do projeto
$ cd discord-manager

# Instale as dependências
$ bun install

# Copie o arquivo de variáveis de ambiente
$ cp .env.example .env
# Preencha as variáveis no .env

# Execute a aplicação em modo de desenvolvimento
$ bun dev

# O servidor iniciará na porta:3000 - acesse http://localhost:3000
```

---

### 🔐 Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `DISCORD_TOKEN` | Token do bot (Discord Developer Portal) |
| `DISCORD_GUILD_ID` | ID do servidor (clique direito no servidor → Copiar ID) |
| `API_KEY` | Chave secreta usada no header `x-api-key` pelo n8n |

Todas as rotas `/api/*` exigem o header:
```
x-api-key: SUA_API_KEY
```

---

### 📡 Endpoints

#### Cargos `/api/roles`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/roles` | Listar todos os cargos |
| POST | `/api/roles` | Criar cargo |
| PATCH | `/api/roles/:roleId` | Editar cargo |
| DELETE | `/api/roles/:roleId` | Deletar cargo |
| PUT | `/api/roles/:roleId/members/:userId` | Dar cargo a membro |
| DELETE | `/api/roles/:roleId/members/:userId` | Remover cargo de membro |

#### Canais `/api/channels`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/channels` | Listar canais |
| POST | `/api/channels` | Criar canal |
| PATCH | `/api/channels/:channelId` | Editar canal |
| DELETE | `/api/channels/:channelId` | Deletar canal |

#### Membros `/api/members`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/members/:userId` | Buscar membro |
| PATCH | `/api/members/:userId/nick` | Editar apelido |
| POST | `/api/members/:userId/timeout` | Silenciar (timeout) |
| DELETE | `/api/members/:userId/timeout` | Remover timeout |
| DELETE | `/api/members/:userId` | Kickar membro |
| PUT | `/api/members/:userId/ban` | Banir membro |
| DELETE | `/api/members/:userId/ban` | Desbanir membro |

#### Mensagens `/api/messages`
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/messages/:channelId` | Enviar mensagem |
| DELETE | `/api/messages/:channelId/:messageId` | Deletar mensagem |
| PUT | `/api/messages/:channelId/:messageId/pin` | Fixar mensagem |

---

### 💡 Exemplos de uso

**Criar cargo**
```json
POST /api/roles
{
  "name": "Player de LoL",
  "color": "#5865F2",
  "hoist": false,
  "mentionable": true
}
```

**Enviar mensagem em canal**
```json
POST /api/messages/ID_DO_CANAL
{
  "content": "Aviso importante! @everyone"
}
```

**Silenciar membro por 10 minutos**
```json
POST /api/members/ID_DO_USUARIO/timeout
{
  "minutes": 10
}
```

---

### ☁️ Deploy no Railway

1. Suba o projeto no GitHub
2. Crie um novo projeto no Railway → **Deploy from GitHub**
3. Adicione as variáveis de ambiente no painel
4. Railway detecta Bun automaticamente pelo `package.json`

---

### 👨‍💻 Autor

<a href="https://github.com/devGustavoR">
 <img style="border-radius: 50%;" src="https://avatars.githubusercontent.com/devgustavor" width="100px;" alt=""/>
 <br />
 <sub><b>Gustavo Ribeiro</b></sub></a> <a href="https://github.com/devGustavoR" title="Github">🚀</a>

Feito com ❤️ por Gustavo Ribeiro 👋🏽 Entre em contato!

[![Twitter Badge](https://img.shields.io/badge/-@devgustavor-1ca0f1?style=flat-square&labelColor=1ca0f1&logo=twitter&logoColor=white&link=https://twitter.com/devgustavor)](https://twitter.com/devgustavor) [![Linkedin Badge](https://img.shields.io/badge/-GustavoR-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/devgustavor)](https://www.linkedin.com/in/devgustavor)
[![Gmail Badge](https://img.shields.io/badge/-devgustavor@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:devgustavor@gmail.com)](mailto:devgustavor@gmail.com)
