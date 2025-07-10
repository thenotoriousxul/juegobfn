import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'

export default class AuthController {
  /**
   * Registro de usuario
   */
  async register({ request, response }: HttpContext) {
    try {
      const { username, email, password } = request.only(['username', 'email', 'password'])

      // Validar que el usuario no exista
      const existingUser = await User.query()
        .where('email', email)
        .orWhere('username', username)
        .first()

      if (existingUser) {
        return response.status(400).json({
          success: false,
          message: 'El usuario o email ya existe'
        })
      }

      // Crear usuario
      const user = await User.create({
        username,
        email,
        password: await hash.make(password),
        gamesWon: 0,
        gamesLost: 0
      })

      return response.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: error.message
      })
    }
  }

  /**
   * Inicio de sesión
   */
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      console.log('Login attempt:', { email, password: password ? '***' : 'undefined' })

      // Buscar usuario
      const user = await User.query().where('email', email).first()
      if (!user) {
        console.log('User not found:', email)
        return response.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        })
      }

      console.log('User found:', { id: user.id, username: user.username, hashedPassword: user.password ? '***' : 'undefined' })

      // Verificar contraseña
      const isValidPassword = await hash.verify(user.password, password)
      console.log('Password verification result:', isValidPassword)
      
      if (!isValidPassword) {
        return response.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        })
      }

      return response.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          gamesWon: user.gamesWon,
          gamesLost: user.gamesLost
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      })
    }
  }

  /**
   * Obtener perfil del usuario
   */
  async profile({ params, response }: HttpContext) {
    try {
      const userId = params.id
      const user = await User.findOrFail(userId)

      return response.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          gamesWon: user.gamesWon,
          gamesLost: user.gamesLost
        }
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }
  }
} 