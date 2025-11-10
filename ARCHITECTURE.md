# Fluxo de Dados - Multi-Server Architecture

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                     │
│                                                                 │
│  ┌───────────────┐    ┌──────────────┐    ┌─────────────────┐ │
│  │  Login/       │───▶│ AuthContext  │───▶│  LocalStorage   │ │
│  │  Register     │    │  (JWT Token) │    │   (Token JWT)   │ │
│  └───────────────┘    └──────────────┘    └─────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Dashboard (Área Protegida)                   │ │
│  │                                                           │ │
│  │  ┌────────────────┐          ┌─────────────────────┐    │ │
│  │  │ ServerSelector │          │  CRUD de Items      │    │ │
│  │  │  • Local       │          │  • Create (POST)    │    │ │
│  │  │  • Prod1       │          │  • Read (GET)       │    │ │
│  │  │  • Prod2       │          │  • Update (PUT)     │    │ │
│  │  │  • All (3x)    │          │  • Delete (DELETE)  │    │ │
│  │  └────────────────┘          └─────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │   api.js         │                        │
│                    │  (Fetch Wrapper) │                        │
│                    └──────────────────┘                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
    
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  SERVIDOR LOCAL  │  │   SERVIDOR       │  │   SERVIDOR       │
│                  │  │   PRODUÇÃO 1     │  │   PRODUÇÃO 2     │
│ localhost:3000   │  │  api-prod1.com   │  │  api-prod2.com   │
│                  │  │                  │  │                  │
│ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │   Database   │ │  │ │   Database   │ │  │ │   Database   │ │
│ │   (SQLite)   │ │  │ │  (MySQL/PG)  │ │  │ │  (MongoDB)   │ │
│ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

## 🔄 Fluxos de Operação

### Modo: VITE_ACTIVE_SERVER=local
```
User Action (Dashboard)
    │
    ├─▶ POST /items {title, description}
    │       │
    │       └──▶ localhost:3000/items
    │                   │
    │                   └──▶ ✅ Item criado
    │                           │
    │                           └──▶ Toast: "Item criado!"
    │
    └─▶ GET /items
            │
            └──▶ localhost:3000/items
                        │
                        └──▶ ✅ Lista de items
                                │
                                └──▶ Renderiza na UI
```

### Modo: VITE_ACTIVE_SERVER=all (Múltiplos Servidores)
```
User Action (Dashboard)
    │
    ├─▶ POST /items {title, description}
    │       │
    │       ├──▶ localhost:3000/items ─────▶ ✅ Sucesso (100ms)
    │       │                                      │
    │       ├──▶ api-prod1.com/items ─────▶ ✅ Sucesso (150ms)
    │       │                                      │
    │       └──▶ api-prod2.com/items ─────▶ ✅ Sucesso (200ms)
    │                                              │
    │       Promise.all([req1, req2, req3])        │
    │                   │                          │
    │                   └──────────────────────────┘
    │                           │
    │                           └──▶ Toast: "Dados enviados com sucesso para 3/3 servidor(es)"
    │
    └─▶ GET /items
            │
            ├──▶ localhost:3000/items ─────▶ ✅ Resposta (80ms)  ◄── PRIMEIRO A RESPONDER
            │                                      │
            ├──▶ api-prod1.com/items ─────▶ ⏳ Ignorado (200ms)
            │
            └──▶ api-prod2.com/items ─────▶ ⏳ Ignorado (300ms)
                                                   │
                                                   └──▶ Renderiza dados do servidor mais rápido
```

## 🛡️ Tratamento de Falhas

### Cenário: Um servidor falha
```
POST /items {title, description}
    │
    ├──▶ localhost:3000/items ─────▶ ✅ Sucesso
    │
    ├──▶ api-prod1.com/items ──────▶ ❌ Erro 500 (Database down)
    │                                     │
    │                                     └──▶ Toast: "Erro em api-prod1.com: Internal Server Error"
    │
    └──▶ api-prod2.com/items ──────▶ ✅ Sucesso

Resultado: Toast "Dados enviados com sucesso para 2/3 servidor(es)"
Status: ✅ Operação bem-sucedida (2 de 3 OK)
```

### Cenário: Todos os servidores falham
```
POST /items {title, description}
    │
    ├──▶ localhost:3000/items ─────▶ ❌ Timeout
    │
    ├──▶ api-prod1.com/items ──────▶ ❌ Erro 500
    │
    └──▶ api-prod2.com/items ──────▶ ❌ Network Error

Resultado: 
    ├─▶ Toast: "Erro em localhost:3000: Timeout"
    ├─▶ Toast: "Erro em api-prod1.com: Internal Server Error"
    ├─▶ Toast: "Erro em api-prod2.com: Network Error"
    └─▶ Throw Error: "Falha ao enviar para todos os servidores"

Status: ❌ Operação falhou completamente
```

## 🔐 Autenticação (JWT Flow)

```
1. LOGIN
   User: email + password
      │
      └──▶ POST /login ──▶ Server
                              │
                              └──▶ { token: "eyJhbG..." }
                                      │
                                      ├──▶ localStorage.setItem('token', jwt)
                                      │
                                      └──▶ Redirect to /dashboard

2. REQUISIÇÕES AUTENTICADAS
   User: Click "Criar Item"
      │
      └──▶ POST /items + { 
              headers: { 
                Authorization: "Bearer eyJhbG..." 
              }
           }
              │
              └──▶ Server valida token
                      │
                      ├──▶ ✅ Token válido → Processa requisição
                      │
                      └──▶ ❌ Token inválido → 401 Unauthorized
                                                  │
                                                  └──▶ localStorage.removeItem('token')
                                                        │
                                                        └──▶ Redirect to /login

3. AUTO-LOGOUT (Token Expiration)
   AuthContext monitora: token.exp
      │
      ├──▶ exp = 1699876543 (timestamp Unix)
      │
      ├──▶ now = Date.now() = 1699876540000
      │
      ├──▶ msLeft = (exp * 1000) - now = 3000ms (3 segundos)
      │
      └──▶ setTimeout(() => signOut(), 3000)
              │
              └──▶ (após 3s) Toast: "Sessão expirada"
                      │
                      └──▶ Redirect to /login
```

## 📈 Performance Comparison

### Single Server (local)
```
Operação: Criar Item
├─ Latência: ~100ms
├─ Requests: 1
├─ Bandwidth: ~500 bytes
└─ Confiabilidade: Se cair, perde dados
```

### Multi Server (all)
```
Operação: Criar Item
├─ Latência: ~100ms (Promise.all usa o mais rápido)
├─ Requests: 3 (paralelo)
├─ Bandwidth: ~1500 bytes
└─ Confiabilidade: ✅✅✅ Alta (backup automático)
```

## 💡 Use Cases

### Use Case 1: Desenvolvimento
```
Desenvolvedor → Local Server
              ↓
         Testa features
              ↓
    Dados apenas em localhost
```

### Use Case 2: Deploy Produção
```
Usuário → Prod1 Server
        ↓
   Aplicação em produção
        ↓
  Dados no servidor principal
```

### Use Case 3: High Availability
```
Usuário → All Servers (3x)
        ↓
   Prod1: ✅ OK (região US-East)
   Prod2: ✅ OK (região EU-West)
   Local: ✅ OK (backup/dev)
        ↓
  Se Prod1 cair → Prod2 mantém dados
  Se Prod2 cair → Prod1 mantém dados
```

### Use Case 4: Multi-Tenant
```
Admin → All Servers (3x)
      ↓
   Cliente A: api-cliente-a.com
   Cliente B: api-cliente-b.com
   Backup:    api-backup.com
      ↓
  Sincroniza dados entre múltiplos clientes
```

---

**Arquitetura implementada com sucesso!** 🚀
