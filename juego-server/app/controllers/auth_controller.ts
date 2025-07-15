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

      const validationErrors = this.validateRegistrationData(username, email, password)
      if (validationErrors.length > 0) {
        return response.status(400).json({
          success: false,
          message: validationErrors.join(', ')
        })
      }

      const existingUserByEmail = await User.query().where('email', email).first()
      if (existingUserByEmail) {
        return response.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        })
      }

      // Eliminada la validación de username único
      // const existingUserByUsername = await User.query().where('username', username).first()
      // if (existingUserByUsername) {
      //   return response.status(400).json({
      //     success: false,
      //     message: 'El nombre de usuario ya existe'
      //   })
      // }

      const user = await User.create({
        username,
        email,
        password: await hash.make(password),
        gamesWon: 0,
        gamesLost: 0
      })

      return response.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente. Ya puedes iniciar sesión.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      })
    } catch (error) {
      console.error('Error en registro:', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno del servidor al registrar usuario'
      })
    }
  }

  /**
   * Inicio de sesión
   */
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      if (!email || !password) {
        return response.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        })
      }

      if (!this.isValidEmail(email)) {
        return response.status(400).json({
          success: false,
          message: 'El formato del email no es válido'
        })
      }

      console.log('Login attempt:', { email, password: password ? '***' : 'undefined' })

      const user = await User.query().where('email', email).first()
      if (!user) {
        console.log('User not found:', email)
        return response.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos'
        })
      }

      console.log('User found:', { id: user.id, username: user.username, hashedPassword: user.password ? '***' : 'undefined' })

      const isValidPassword = await hash.verify(user.password, password)
      console.log('Password verification result:', isValidPassword)
      
      if (!isValidPassword) {
        return response.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos'
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
      console.error('Error en login:', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno del servidor al iniciar sesión'
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

  /**
   * Validar datos de registro
   */
  private validateRegistrationData(username: string, email: string, password: string): string[] {
    const errors: string[] = []

    if (!username || username.trim().length < 3) {
      errors.push('El nombre de usuario debe tener al menos 3 caracteres')
    }

    if (!email || !this.isValidEmail(email)) {
      errors.push('El formato del email no es válido')
    }

    if (!password || password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres')
    }

    return errors
  }

  /**
   * Validar formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
} 