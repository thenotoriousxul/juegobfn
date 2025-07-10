# 🚢 Juego Naval - AdonisJS 6 + Angular 20

Un juego naval completo desarrollado con AdonisJS 6 para el backend y Angular 20 para el frontend, utilizando polling para simular tiempo real.

## 🎯 Características

- **Autenticación completa**: Registro e inicio de sesión de usuarios
- **Juegos multijugador**: Hasta 2 jugadores por partida
- **Tableros aleatorios**: Generación automática de tableros 8x8 con 15 barcos
- **Tiempo real**: Polling para actualizaciones en tiempo real
- **Estadísticas**: Seguimiento de partidas ganadas y perdidas
- **Historial**: Visualización de movimientos y tableros finales
- **Interfaz moderna**: Diseño responsive con Bootstrap

## 🛠️ Tecnologías Utilizadas

### Backend (AdonisJS 6)
- **Framework**: AdonisJS 6
- **Base de datos**: MySQL
- **ORM**: Lucid ORM
- **Autenticación**: Hash de contraseñas
- **API**: RESTful endpoints

### Frontend (Angular 20)
- **Framework**: Angular 20
- **UI**: Bootstrap 5 + ng-bootstrap
- **HTTP**: Axios para peticiones
- **Estado**: RxJS para manejo de estado
- **Polling**: Short y Long polling para tiempo real

## 📋 Requisitos Previos

- Node.js 18+ 
- MySQL 8.0+
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd juego
```

### 2. Configurar el Backend

```bash
cd juego-server

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Editar el archivo `.env` con tu configuración de base de datos:
```env
NODE_ENV=development
PORT=3333
APP_KEY=tu-app-key-aqui
HOST=localhost

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu-password
DB_DATABASE=juego_naval
```

### 3. Configurar la Base de Datos

```bash
# Crear la base de datos
mysql -u root -p
CREATE DATABASE juego_naval;
exit;

# Ejecutar migraciones
node ace migration:run
```

### 4. Configurar el Frontend

```bash
# Volver al directorio raíz
cd ..

# Instalar dependencias
npm install
```

### 5. Ejecutar la Aplicación

#### Terminal 1 - Backend
```bash
cd juego-server
npm run dev
```

#### Terminal 2 - Frontend
```bash
npm start
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3333

## 🎮 Cómo Jugar

### 1. Registro/Inicio de Sesión
- Accede a http://localhost:4200
- Regístrate con un nuevo usuario o inicia sesión

### 2. Crear o Unirse a un Juego
- En el dashboard, crea un nuevo juego o únete a uno existente
- Los juegos requieren exactamente 2 jugadores para comenzar

### 3. Jugar
- Cada jugador tiene un tablero 8x8 con 15 barcos posicionados aleatoriamente
- Haz clic en el tablero del oponente para disparar
- Los barcos se hunden cuando todos sus segmentos son golpeados
- El primer jugador en hundir todos los barcos del oponente gana

### 4. Ver Estadísticas
- Consulta tu historial de partidas ganadas y perdidas
- Visualiza los tableros finales de partidas anteriores

## 📊 Estructura del Proyecto

```
juego/
├── src/                          # Frontend Angular
│   ├── app/
│   │   ├── components/           # Componentes de la UI
│   │   │   ├── auth/            # Autenticación
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   ├── game/            # Componente del juego
│   │   │   └── game-board/      # Tablero del juego
│   │   ├── services/            # Servicios de API
│   │   └── app.routes.ts        # Rutas de Angular
│   └── styles.css               # Estilos globales
├── juego-server/                 # Backend AdonisJS
│   ├── app/
│   │   ├── controllers/         # Controladores de API
│   │   ├── models/              # Modelos de datos
│   │   └── services/            # Lógica de negocio
│   ├── database/
│   │   └── migrations/          # Migraciones de BD
│   └── start/
│       └── routes.ts            # Rutas del backend
└── README.md
```

## 🔧 API Endpoints

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `GET /auth/profile/:id` - Perfil de usuario

### Juegos
- `GET /games` - Listar juegos disponibles
- `POST /games` - Crear nuevo juego
- `POST /games/:id/join` - Unirse a un juego
- `GET /games/:id` - Estado del juego
- `POST /games/:id/move` - Realizar movimiento
- `GET /games/:id/moves` - Historial de movimientos
- `GET /games/:id/details` - Detalles del juego

### Estadísticas
- `GET /users/:userId/stats` - Estadísticas del usuario

## 🎯 Características Técnicas

### Polling
- **Short Polling**: Cada 2 segundos para actualizar estado del juego
- **Long Polling**: Cada 5 segundos para verificar nuevos juegos

### Seguridad
- Contraseñas hasheadas con bcrypt
- Validación de datos en frontend y backend
- Control de acceso a juegos

### Base de Datos
- **Users**: Información de usuarios y estadísticas
- **Games**: Información de partidas
- **GamePlayers**: Jugadores en cada partida
- **GameMoves**: Historial de movimientos

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que MySQL esté ejecutándose
- Confirma las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `juego_naval` exista

### Error de CORS
- El backend ya tiene CORS configurado para desarrollo
- Verifica que el frontend esté en `http://localhost:4200`

### Error de migraciones
```bash
cd juego-server
node ace migration:rollback
node ace migration:run
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

---

¡Disfruta jugando al Juego Naval! 🚢⚓
