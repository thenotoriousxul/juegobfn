/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Rutas de autenticación (públicas)
router.post('/auth/register', '#controllers/auth_controller.register')
router.post('/auth/login', '#controllers/auth_controller.login')
router.get('/auth/profile/:id', '#controllers/auth_controller.profileById')

// Rutas protegidas
router.group(() => {
  // Perfil del usuario autenticado
  router.get('/auth/profile', '#controllers/auth_controller.profile')
  router.post('/auth/logout', '#controllers/auth_controller.logout')
  
  // Rutas de juegos
  router.get('/games', '#controllers/games_controller.index')
  router.post('/games', '#controllers/games_controller.store')
  router.get('/games/active', '#controllers/games_controller.getActiveGames')
  router.post('/games/:id/join', '#controllers/games_controller.join')
  router.delete('/games/:id/cancel', '#controllers/games_controller.cancelMatchmaking')
  router.post('/games/:id/surrender', '#controllers/games_controller.surrender')
  router.get('/games/:id', '#controllers/games_controller.show')
  router.post('/games/:id/move', '#controllers/games_controller.makeMove')
  router.get('/games/:id/moves', '#controllers/games_controller.getMoves')
  router.get('/games/:id/details', '#controllers/games_controller.getGameDetails')
  
  // Rutas de estadísticas
  router.get('/users/:userId/stats', '#controllers/games_controller.getUserStats')
}).use(middleware.auth())

// Ruta de prueba
router.get('/', async () => {
  return {
    message: 'API del Juego Naval funcionando correctamente',
    version: '1.0.0'
  }
})