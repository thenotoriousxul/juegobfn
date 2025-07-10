#!/bin/bash

echo "🚢 Instalando Juego Naval - AdonisJS 6 + Angular 20"
echo "=================================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ Node.js y npm encontrados"

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
npm install

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd juego-server
npm install
cd ..

# Crear archivo .env si no existe
if [ ! -f "juego-server/.env" ]; then
    echo "🔧 Creando archivo .env..."
    cat > juego-server/.env << EOF
NODE_ENV=development
PORT=3333
APP_KEY=your-app-key-here
HOST=localhost

# Database configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=juego_naval
EOF
    echo "✅ Archivo .env creado. Por favor edítalo con tus credenciales de base de datos"
fi

echo ""
echo "🎉 Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura tu base de datos MySQL"
echo "2. Edita juego-server/.env con tus credenciales"
echo "3. Crea la base de datos 'juego_naval'"
echo "4. Ejecuta las migraciones: cd juego-server && node ace migration:run"
echo "5. Inicia el backend: cd juego-server && npm run dev"
echo "6. Inicia el frontend: npm start"
echo ""
echo "🌐 La aplicación estará disponible en:"
echo "   Frontend: http://localhost:4200"
echo "   Backend:  http://localhost:3333" 