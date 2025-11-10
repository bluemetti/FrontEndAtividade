# 🚀 Deploy no Vercel - Guia Rápido

## Passo 1: Prepare seu repositório

Certifique-se de que o código está commitado no GitHub/GitLab/Bitbucket.

```bash
git add .
git commit -m "Frontend pronto para deploy"
git push origin main
```

## Passo 2: Conecte ao Vercel

1. Acesse https://vercel.com
2. Clique em **"Add New Project"**
3. Importe seu repositório
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## Passo 3: Configure as Variáveis de Ambiente

No painel do Vercel, vá em: **Settings → Environment Variables**

### Adicione estas variáveis:

#### Para Production (branch main):

| Nome da Variável | Valor | Ambientes |
|------------------|-------|-----------|
| `VITE_API_PROD1_NAME` | `API Principal` | Production, Preview |
| `VITE_API_PROD1_URL` | `https://sua-api-principal.com` | Production, Preview |
| `VITE_API_PROD2_NAME` | `API Backup` | Production, Preview |
| `VITE_API_PROD2_URL` | `https://sua-api-backup.com` | Production, Preview |
| `VITE_DEFAULT_SERVER` | `prod1` | Production, Preview |

#### Para Development (opcional):

| Nome da Variável | Valor | Ambientes |
|------------------|-------|-----------|
| `VITE_API_LOCAL_NAME` | `Local` | Development |
| `VITE_API_LOCAL_URL` | `http://localhost:3000` | Development |

### ⚠️ IMPORTANTE:
- Substitua as URLs pelas URLs reais das suas APIs de produção
- Certifique-se de que as APIs estão configuradas para aceitar requisições do domínio do Vercel (CORS)

## Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build terminar
3. Acesse a URL gerada pelo Vercel

## Passo 5: Teste

1. Acesse seu site no Vercel
2. Tente registrar um usuário
3. Faça login
4. Teste o CRUD de items
5. Use o seletor de servidor para alternar entre APIs

## 🔧 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se as URLs das APIs estão corretas
- Verifique se o CORS está configurado na API para aceitar o domínio do Vercel

### Erro: "401 Unauthorized"
- Verifique se o token JWT está sendo enviado corretamente
- Verifique se a API está validando o token corretamente

### Variáveis não estão funcionando
- Certifique-se de que as variáveis começam com `VITE_`
- Faça um novo deploy após adicionar/modificar variáveis
- Limpe o cache: Settings → General → Clear Cache

## 📋 Checklist Final

- [ ] Código commitado e pushed para o repositório
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build completado com sucesso
- [ ] Site acessível
- [ ] Registro de usuário funciona
- [ ] Login funciona
- [ ] CRUD de items funciona
- [ ] Troca entre servidores funciona
- [ ] Auto-logout por expiração de token funciona

## 🌐 Domínio Customizado (Opcional)

1. Vá em **Settings → Domains**
2. Adicione seu domínio customizado
3. Configure o DNS conforme instruções do Vercel

## 🔄 Deploys Automáticos

Cada push para a branch `main` irá disparar um novo deploy automaticamente!

---

**Dúvidas?** Consulte a [documentação oficial do Vercel](https://vercel.com/docs)
