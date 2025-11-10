# Guia de Configuração de Múltiplos Servidores

## 📡 Visão Geral

Este projeto permite enviar dados para até **3 servidores API** diferentes:
- **1 servidor local** (desenvolvimento)
- **2 servidores de produção**

## 🚀 Configuração Rápida

### Passo 1: Criar arquivo de configuração

```bash
cp .env.example .env
```

### Passo 2: Editar URLs dos servidores

Abra o arquivo `.env` e configure as URLs:

```env
# Servidor Local (desenvolvimento)
VITE_API_LOCAL=http://localhost:3000

# Servidor de Produção 1 (exemplo: AWS)
VITE_API_PROD_1=https://api.meuapp.com

# Servidor de Produção 2 (exemplo: Heroku)
VITE_API_PROD_2=https://meuapp-backup.herokuapp.com

# Escolha qual servidor usar
VITE_ACTIVE_SERVER=local
```

### Passo 3: Escolher modo de operação

Altere `VITE_ACTIVE_SERVER` para uma das opções:

| Valor | Comportamento |
|-------|--------------|
| `local` | ✅ Envia apenas para servidor local |
| `prod1` | ✅ Envia apenas para produção 1 |
| `prod2` | ✅ Envia apenas para produção 2 |
| `all` | 🔄 Envia para TODOS os 3 servidores |

### Passo 4: Reiniciar servidor

```bash
npm run dev
```

## 💡 Casos de Uso

### Desenvolvimento Local
```env
VITE_ACTIVE_SERVER=local
```
- Use durante desenvolvimento
- Dados vão apenas para `http://localhost:3000`

### Deploy em Produção Principal
```env
VITE_ACTIVE_SERVER=prod1
```
- Use quando deployar em produção
- Dados vão apenas para o servidor principal

### Sincronização com Múltiplos Servidores
```env
VITE_ACTIVE_SERVER=all
```
- **Replica dados em tempo real** para todos os servidores
- Útil para:
  - Backup automático
  - Alta disponibilidade
  - Sincronização multi-região
  - Ambiente de teste + produção simultâneos

## 🔍 Como Funciona

### Modo Single Server (local, prod1, prod2)
```
Frontend → API Server
         ← Response
```
Comportamento normal, uma requisição por vez.

### Modo All Servers
```
Frontend → API Server Local
        → API Server Prod1
        → API Server Prod2
        ← Primeiro que responder com sucesso
```

- Envia requisições em **paralelo** (Promise.all)
- Exibe toast: `"Dados enviados com sucesso para 3/3 servidor(es)"`
- Se um servidor falhar, os outros continuam
- Retorna dados do primeiro servidor que responder

## 🎯 Exemplos Práticos

### Exemplo 1: Desenvolvimento Local
```env
VITE_API_LOCAL=http://localhost:3000
VITE_API_PROD_1=
VITE_API_PROD_2=
VITE_ACTIVE_SERVER=local
```

### Exemplo 2: Produção com Backup
```env
VITE_API_LOCAL=http://localhost:3000
VITE_API_PROD_1=https://api-primary.exemplo.com
VITE_API_PROD_2=https://api-backup.exemplo.com
VITE_ACTIVE_SERVER=all
```
✅ Cria item no servidor principal
✅ Cria item no servidor backup
✅ Se um falhar, o outro mantém os dados

### Exemplo 3: Multi-tenant
```env
VITE_API_LOCAL=http://localhost:3000
VITE_API_PROD_1=https://api-cliente-a.com
VITE_API_PROD_2=https://api-cliente-b.com
VITE_ACTIVE_SERVER=all
```
✅ Sincroniza dados entre múltiplos clientes

## 🛡️ Tratamento de Erros

### Quando um servidor falha:
```
✅ Servidor 1: Sucesso
❌ Servidor 2: Timeout
✅ Servidor 3: Sucesso

Toast exibido:
"Dados enviados com sucesso para 2/3 servidor(es)"
"Erro em https://servidor2.com: Timeout"
```

### Quando todos falham:
```
❌ Todos os servidores falharam
Toast: "Falha ao enviar para todos os servidores"
Erro lançado para tratamento na UI
```

## 📊 Monitoramento

O componente `ServerSelector` no Dashboard mostra:
- ✅ Servidor(es) ativo(s)
- ✅ URLs configuradas
- ✅ Modo de operação atual

## 🔐 Segurança

- Token JWT é enviado para **todos** os servidores ativos
- Cada servidor valida o token independentemente
- Recomendado: usar o mesmo secret JWT em todos os servidores

## ⚡ Performance

### Modo Single Server:
- Latência: ~50-200ms (depende do servidor)

### Modo All Servers:
- Latência: ~50-200ms (paralelo, espera o mais rápido)
- 3x requisições simultâneas
- Use apenas se necessário (backup, multi-região)

## 🐛 Troubleshooting

### Erro: "Cannot read env variables"
**Solução:** Certifique-se que o arquivo `.env` existe na raiz do projeto

### Erro: "CORS blocked"
**Solução:** Configure CORS no backend para aceitar requisições do frontend

### Erro: "401 Unauthorized"
**Solução:** Verifique se o token JWT é válido em todos os servidores

### Mudanças no .env não aplicam
**Solução:** Reinicie o servidor de desenvolvimento (`npm run dev`)

## 📝 Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Configure URLs corretas em `.env`
- [ ] Teste cada servidor individualmente (local, prod1, prod2)
- [ ] Teste modo `all` se for usar sincronização
- [ ] Verifique CORS nos servidores backend
- [ ] Confirme que todos usam o mesmo secret JWT
- [ ] Teste tratamento de erro (desligue um servidor)
- [ ] Monitore logs de requisições

---

**Pronto!** Agora você pode trabalhar com múltiplos servidores de forma transparente. 🚀
