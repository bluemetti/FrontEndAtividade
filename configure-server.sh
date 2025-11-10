#!/bin/bash

# Script para trocar facilmente entre configurações de servidor

echo "🔧 Configurador de Servidores - FrontEnd Atividade"
echo "=================================================="
echo ""
echo "Escolha a configuração:"
echo ""
echo "1) Desenvolvimento Local (apenas localhost:3000)"
echo "2) Produção Simples (apenas servidor principal)"
echo "3) Múltiplos Servidores (todos os 3 simultaneamente)"
echo "4) Personalizado (editar .env manualmente)"
echo ""
read -p "Digite o número da opção [1-4]: " choice

case $choice in
  1)
    echo "✅ Configurando para Desenvolvimento Local..."
    cp .env.development .env
    echo "✅ Pronto! Servidor ativo: LOCAL"
    echo "   URL: http://localhost:3000"
    ;;
  2)
    echo "✅ Configurando para Produção Simples..."
    cp .env.production .env
    echo "✅ Pronto! Servidor ativo: PRODUÇÃO 1"
    echo "   ⚠️  Não esqueça de configurar a URL em .env"
    ;;
  3)
    echo "✅ Configurando para Múltiplos Servidores..."
    cp .env.multiserver .env
    echo "✅ Pronto! Servidor ativo: TODOS (3 servidores)"
    echo "   ⚠️  Não esqueça de configurar as URLs em .env"
    ;;
  4)
    echo "📝 Abrindo .env para edição manual..."
    ${EDITOR:-nano} .env
    ;;
  *)
    echo "❌ Opção inválida!"
    exit 1
    ;;
esac

echo ""
echo "🔄 Reinicie o servidor de desenvolvimento para aplicar:"
echo "   npm run dev"
echo ""
