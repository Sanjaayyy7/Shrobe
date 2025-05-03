#!/bin/bash

echo "🚀 Configurando el proyecto Shrobe..."

# Hacer que el script de configuración de variables de entorno sea ejecutable
chmod +x scripts/setup-env.sh

# Ejecutar el script para crear .env.local
./scripts/setup-env.sh

# Instalar dependencias
echo "📦 Instalando dependencias..."
if command -v pnpm &> /dev/null; then
    pnpm install
else
    echo "⚠️ pnpm no está instalado. Intentando usar npm..."
    npm install
fi

echo "✅ Configuración completada. Ahora puedes ejecutar el proyecto con:"
echo "pnpm dev   # Si estás usando pnpm"
echo "npm run dev  # Si estás usando npm" 