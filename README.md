# FrontEnd Atividade

Projeto front-end em React para integrar com a API já construída. Implementa telas de cadastro, login e área protegida por JWT.

## ⚡ Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar servidor (escolher local, prod1, prod2 ou all)
./configure-server.sh

# 3. Rodar aplicação
npm run dev

# 4. Acessar no navegador
# http://localhost:5173
```

## 🌟 Novidade: Suporte a Múltiplos Servidores

Este projeto permite enviar dados para **até 3 servidores** simultaneamente:
- ✅ 1 servidor local (desenvolvimento)
- ✅ 2 servidores de produção
- ✅ Modo "all" sincroniza dados em todos os 3 servidores em tempo real

**Ideal para:** backup automático, alta disponibilidade, multi-região, multi-tenant.

## 🚀 Como usar

### 1. Instale as dependências:

```bash
npm install
```

### 2. Execute em modo de desenvolvimento:

```bash
npm run dev
```

### 3. Acesse no navegador:

O Vite irá mostrar a URL (padrão: http://localhost:5173)

## 📋 Funcionalidades implementadas

### ✅ Telas públicas:
- **Cadastro** (`/register`): Formulário com nome, e-mail e senha → POST `/register`
- **Login** (`/login`): Formulário com e-mail e senha → POST `/login` → armazena token JWT

### ✅ Tela protegida:
- **Dashboard** (`/dashboard`): CRUD completo de items
  - GET `/items` - Listar todos os items
  - POST `/items` - Criar novo item
  - PUT `/items/:id` - Editar item existente
  - DELETE `/items/:id` - Deletar item
  - Botão de logout
  - Redirecionamento automático ao expirar token

### ✅ Recursos adicionais:
- **Toasts** (react-toastify) para feedback de erros/sucessos
- **Loading states** durante requisições
- **Responsividade** (mobile-friendly)
- **Auto-logout** quando token JWT expira
- **Tratamento de erros** com mensagens visuais amigáveis
- **Redirecionamento automático** em caso de 401 (não autorizado)

## ⚙️ Configuração da API

### Configuração de Múltiplos Servidores

O projeto suporta envio de dados para **até 3 servidores** simultaneamente:
- 1 servidor local (desenvolvimento)
- 2 servidores de produção

### Como configurar:

**Opção 1: Usando o script automático (recomendado)**
```bash
./configure-server.sh
```
Escolha uma das opções:
1. Desenvolvimento Local
2. Produção Simples
3. Múltiplos Servidores (todos)
4. Personalizado

**Opção 2: Configuração manual**

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Edite o arquivo `.env`:**
   ```env
   # Servidor Local (desenvolvimento)
   VITE_API_LOCAL=http://localhost:3000

   # Servidor de Produção 1
   VITE_API_PROD_1=https://api-prod-1.exemplo.com

   # Servidor de Produção 2
   VITE_API_PROD_2=https://api-prod-2.exemplo.com

   # Servidor ativo: local, prod1, prod2, ou all
   VITE_ACTIVE_SERVER=local
   ```

3. **Opções de `VITE_ACTIVE_SERVER`:**
   - `local` - Envia apenas para o servidor local
   - `prod1` - Envia apenas para o servidor de produção 1
   - `prod2` - Envia apenas para o servidor de produção 2
   - `all` - **Envia para TODOS os 3 servidores simultaneamente**

4. **Recarregue a aplicação** após alterar o `.env`

#### Comportamento com múltiplos servidores:

Quando `VITE_ACTIVE_SERVER=all`:
- Todas as requisições (POST, PUT, DELETE) são enviadas para os 3 servidores em paralelo
- Um toast mostra quantos servidores receberam os dados com sucesso
- Se algum servidor falhar, o erro é exibido mas a operação continua nos outros
- Requisições GET usam o primeiro servidor que responder com sucesso

#### Monitoramento visual:

No Dashboard há um componente `ServerSelector` que mostra:
- Qual servidor está ativo
- URLs configuradas
- Quantos servidores receberão os dados

## 🧪 Testando expiração de token

Para testar o redirecionamento automático quando o token expira:

1. Configure seu backend para emitir tokens com expiração curta (ex: 10 segundos)
2. Faça login normalmente
3. Aguarde a expiração → você será redirecionado automaticamente para `/login` com mensagem "Sessão expirada"

## 📦 Tecnologias utilizadas

- **React** 18.2
- **React Router DOM** 6.18 (navegação)
- **React Toastify** 9.1 (notificações)
- **Vite** 5.0 (bundler/dev server)
- **Fetch API** (requisições HTTP)
- **LocalStorage** (armazenamento de token)

## 🎨 Estrutura do projeto

```
/
├── .env                      # Configuração ativa (não comitar!)
├── .env.example              # Template de configuração
├── .env.development          # Preset: desenvolvimento local
├── .env.production           # Preset: produção simples
├── .env.multiserver          # Preset: múltiplos servidores
├── configure-server.sh       # Script para trocar configurações
├── MULTI_SERVER_GUIDE.md     # Guia detalhado de multi-server
├── ARCHITECTURE.md           # Diagrama de arquitetura e fluxos
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Rotas e proteção
    ├── index.css             # Estilos globais
    ├── components/
    │   └── ServerSelector.jsx  # Seletor de servidores
    ├── contexts/
    │   └── AuthContext.jsx     # Gerenciamento de autenticação
    ├── pages/
    │   ├── Register.jsx        # Tela de cadastro
    │   ├── Login.jsx           # Tela de login
    │   └── Dashboard.jsx       # Área protegida com CRUD
    └── services/
        └── api.js              # Wrapper multi-server
```

## 📝 Endpoints esperados da API

O frontend espera que o backend forneça os seguintes endpoints:

- `POST /register` - Cadastro de usuário
  ```json
  { "name": "...", "email": "...", "password": "..." }
  ```

- `POST /login` - Login
  ```json
  { "email": "...", "password": "..." }
  ```
  Resposta: `{ "token": "eyJhbGc..." }`

- `GET /items` - Listar items (requer autenticação)
- `POST /items` - Criar item (requer autenticação)
- `PUT /items/:id` - Atualizar item (requer autenticação)
- `DELETE /items/:id` - Deletar item (requer autenticação)

**Autenticação**: Header `Authorization: Bearer <token>`

## 🔐 Segurança

- Token JWT armazenado em localStorage
- Auto-logout quando token expira
- Redirecionamento automático em 401
- Validação de formulários (required, minLength)

---

Desenvolvido para a atividade de Frontend com integração à API backend.