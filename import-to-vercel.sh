#!/bin/bash

# Script para importar variáveis de ambiente do .env.production para o Vercel
# Uso: ./import-to-vercel.sh

echo "🚀 Importando variáveis de ambiente para o Vercel..."
echo ""

if [ ! -f ".env.production" ]; then
  echo "❌ Erro: Arquivo .env.production não encontrado!"
  exit 1
fi

# Verifica se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI não está instalado!"
  echo "📦 Instalando Vercel CLI..."
  npm install -g vercel
fi

echo "🔐 Fazendo login no Vercel..."
vercel login

echo ""
echo "📋 Lendo variáveis do arquivo .env.production..."
echo ""

# Contador de variáveis importadas
count=0

# Lê o arquivo linha por linha
while IFS='=' read -r key value; do
  # Remove espaços em branco
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  
  # Ignora comentários, linhas vazias e separadores
  if [[ ! $key =~ ^# && -n $key && ! $key =~ ^= ]]; then
    echo "✅ Adicionando: $key"
    
    # Adiciona a variável ao Vercel para production e preview
    echo "$value" | vercel env add "$key" production --force 2>/dev/null
    echo "$value" | vercel env add "$key" preview --force 2>/dev/null
    
    ((count++))
  fi
done < .env.production

echo ""
echo "✨ Processo concluído!"
echo "📊 Total de variáveis importadas: $count"
echo ""
echo "🔍 Verificando variáveis no Vercel..."
vercel env ls

echo ""
echo "🎯 Próximos passos:"
echo "1. Edite o arquivo .env.production com as URLs reais das suas APIs"
echo "2. Execute novamente este script para atualizar"
echo "3. Faça o deploy: vercel --prod"
echo ""
echo "✅ Pronto! Suas variáveis estão configuradas no Vercel."
