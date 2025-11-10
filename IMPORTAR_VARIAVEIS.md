# 🚀 Importar Variáveis de Ambiente no Vercel

## Método 1: Via Vercel CLI (Recomendado)

### 1. Instale o Vercel CLI

```bash
npm install -g vercel
```

### 2. Faça login

```bash
vercel login
```

### 3. Entre na pasta do projeto

```bash
cd /workspaces/FrontEndAtividade
```

### 4. Importe as variáveis do arquivo `.env.production`

```bash
vercel env pull .env.local
```

Ou adicione manualmente com:

```bash
# Para cada variável do arquivo .env.production:
vercel env add VITE_API_PROD1_NAME production
vercel env add VITE_API_PROD1_URL production
vercel env add VITE_API_PROD2_NAME production
vercel env add VITE_API_PROD2_URL production
vercel env add VITE_DEFAULT_SERVER production
```

### 5. Ou use o script automatizado:

```bash
# Criar script de importação
cat > import-env.sh << 'EOF'
#!/bin/bash

# Lê o arquivo .env.production e adiciona cada variável ao Vercel
while IFS='=' read -r key value; do
  # Ignora comentários e linhas vazias
  if [[ ! $key =~ ^# && -n $key ]]; then
    # Remove espaços em branco
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    echo "Adicionando: $key"
    echo "$value" | vercel env add "$key" production
  fi
done < .env.production

echo "✅ Todas as variáveis foram importadas!"
EOF

chmod +x import-env.sh
./import-env.sh
```

## Método 2: Via Interface Web (Manual)

### 1. Abra seu projeto no Vercel Dashboard

https://vercel.com/dashboard

### 2. Vá em Settings → Environment Variables

### 3. Copie e cole as variáveis do arquivo `.env.production`:

Abra o arquivo `.env.production` e adicione cada variável:

```
Nome: VITE_API_PROD1_NAME
Valor: API Principal
Ambiente: Production, Preview
```

```
Nome: VITE_API_PROD1_URL
Valor: https://sua-api-principal.com
Ambiente: Production, Preview
```

```
Nome: VITE_API_PROD2_NAME
Valor: API Backup
Ambiente: Production, Preview
```

```
Nome: VITE_API_PROD2_URL
Valor: https://sua-api-backup.com
Ambiente: Production, Preview
```

```
Nome: VITE_DEFAULT_SERVER
Valor: prod1
Ambiente: Production, Preview
```

## Método 3: Via arquivo vercel.json (Mais Simples!)

Crie um arquivo `vercel.json` na raiz do projeto e o Vercel vai importar automaticamente:

```json
{
  "env": {
    "VITE_API_LOCAL_NAME": "Local",
    "VITE_API_LOCAL_URL": "http://localhost:3000",
    "VITE_API_PROD1_NAME": "API Principal",
    "VITE_API_PROD1_URL": "https://sua-api-principal.com",
    "VITE_API_PROD2_NAME": "API Backup",
    "VITE_API_PROD2_URL": "https://sua-api-backup.com",
    "VITE_DEFAULT_SERVER": "prod1"
  }
}
```

⚠️ **ATENÇÃO**: Não commite dados sensíveis no `vercel.json`! Use para valores públicos apenas.

## ✅ Verificar se as variáveis foram importadas

```bash
vercel env ls
```

## 🔄 Fazer novo deploy após importar

```bash
vercel --prod
```

## 📝 Antes de importar

**IMPORTANTE**: Edite o arquivo `.env.production` e substitua as URLs de exemplo pelas URLs reais:

- `https://sua-api-principal.com` → URL real da sua API principal
- `https://sua-api-backup.com` → URL real da sua API backup

---

**Dica**: Use o Método 3 (vercel.json) para facilitar! É o mais rápido e direto.
