@echo off
echo 🚢 Instalando Juego Naval - AdonisJS 6 + Angular 20
echo ==================================================

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 18+
    pause
    exit /b 1
)

REM Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado
    pause
    exit /b 1
)

echo ✅ Node.js y npm encontrados

REM Instalar dependencias del frontend
echo 📦 Instalando dependencias del frontend...
npm install

REM Instalar dependencias del backend
echo 📦 Instalando dependencias del backend...
cd juego-server
npm install
cd ..

REM Crear archivo .env si no existe
if not exist "juego-server\.env" (
    echo 🔧 Creando archivo .env...
    (
        echo NODE_ENV=development
        echo PORT=3333
        echo APP_KEY=your-app-key-here
        echo HOST=localhost
        echo.
        echo # Database configuration
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_DATABASE=juego_naval
    ) > juego-server\.env
    echo ✅ Archivo .env creado. Por favor edítalo con tus credenciales de base de datos
)

echo.
echo 🎉 Instalación completada!
echo.
echo 📋 Próximos pasos:
echo 1. Configura tu base de datos MySQL
echo 2. Edita juego-server\.env con tus credenciales
echo 3. Crea la base de datos 'juego_naval'
echo 4. Ejecuta las migraciones: cd juego-server ^&^& node ace migration:run
echo 5. Inicia el backend: cd juego-server ^&^& npm run dev
echo 6. Inicia el frontend: npm start
echo.
echo 🌐 La aplicación estará disponible en:
echo    Frontend: http://localhost:4200
echo    Backend:  http://localhost:3333
pause 