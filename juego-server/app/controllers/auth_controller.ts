import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'

export default class AuthController {
  /**
   * Registro de usuario
   */
  async register({ request, response }: HttpContext) {
    try {
      const { username, name, email, password } = request.only(['username', 'name', 'email', 'password'])
      const finalUsername = username || name

      const validationErrors = this.validateRegistrationData(finalUsername, email, password)
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
        username: finalUsername,
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

      // Generar token de acceso
      const token = await User.accessTokens.create(user, ['*'], {
        name: 'api_token',
        expiresIn: '30 days'
      })

      return response.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          gamesWon: user.gamesWon,
          gamesLost: user.gamesLost
        },
        token: {
          type: 'Bearer',
          value: token.value!.release()
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
   * Cerrar sesión (invalidar token)
   */
  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const token = auth.user?.currentAccessToken

      if (token) {
        await User.accessTokens.delete(user, token.identifier)
      }

      return response.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al cerrar sesión'
      })
    }
  }

  /**
   * Obtener perfil del usuario autenticado (usando token)
   */
  async profile({ auth, response }: HttpContext) {
    try {
      // El middleware auth ya debería haber autenticado al usuario
      const user = auth.getUserOrFail()
      
      return response.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          gamesWon: user.gamesWon,
          gamesLost: user.gamesLost,
          createdAt: user.createdAt
        }
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return response.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      })
    }
  }

  /**
   * Obtener perfil de usuario por ID (mantiene compatibilidad)
   */
  async profileById({ params, response }: HttpContext) {
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