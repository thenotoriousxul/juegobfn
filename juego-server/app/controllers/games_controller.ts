import { HttpContext } from '@adonisjs/core/http'
import GameService from '#services/game_service'
import Game from '#models/game'
import GamePlayer from '#models/game_player'
import GameMove from '#models/game_move'

export default class GamesController {
  /**
   * Listar todos los juegos disponibles
   */
  async index({ response }: HttpContext) {
    try {
      const games = await Game.query()
        .where('status', 'waiting')
        .preload('creator')
        .preload('players', (query) => {
          query.preload('user')
        })

      return response.json({
        success: true,
        games: games.map(game => ({
          id: game.id,
          name: game.name,
          status: game.status,
          creator: game.creator.username,
          playerCount: game.players.length,
          players: game.players.map(player => ({
            id: player.userId,
            username: player.user.username
          }))
        }))
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener juegos',
        error: error.message
      })
    }
  }

  /**
   * Crear un nuevo juego
   */
  async store({ request, response }: HttpContext) {
    try {
      const { name, creatorId } = request.only(['name', 'creatorId'])
      
      const game = await GameService.createGame(name, creatorId)
      
      return response.status(201).json({
        success: true,
        message: 'Juego creado exitosamente',
        game: {
          id: game.id,
          name: game.name,
          status: game.status
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al crear juego',
        error: error.message
      })
    }
  }

  /**
   * Unirse a un juego
   */
  async join({ params, request, response }: HttpContext) {
    try {
      const gameId = params.id
      const { userId } = request.only(['userId'])
      
      const gamePlayer = await GameService.joinGame(gameId, userId)
      
      return response.json({
        success: true,
        message: 'Te has unido al juego exitosamente',
        gamePlayer: {
          id: gamePlayer.id,
          gameId: gamePlayer.gameId,
          userId: gamePlayer.userId,
          shipsRemaining: gamePlayer.shipsRemaining,
          isCurrentTurn: gamePlayer.isCurrentTurn
        }
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  /**
   * Obtener estado del juego
   */
  async show({ params, request, response }: HttpContext) {
    try {
      const gameId = params.id
      const { userId } = request.qs()
      
      if (!userId) {
        return response.status(400).json({
          success: false,
          message: 'Se requiere userId'
        })
      }

      const gameState = await GameService.getGameState(gameId, parseInt(userId))
      
      return response.json({
        success: true,
        gameState
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  /**
   * Realizar un movimiento
   */
  async makeMove({ params, request, response }: HttpContext) {
    try {
      const gameId = params.id
      const { playerId, position } = request.only(['playerId', 'position'])
      
      const result = await GameService.makeMove(gameId, playerId, position)
      
      return response.json({
        success: true,
        message: result.hit ? '¡Impacto!' : 'Agua',
        result
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  /**
   * Obtener historial de movimientos de un juego
   */
  async getMoves({ params, response }: HttpContext) {
    try {
      const gameId = params.id
      
      const moves = await GameMove.query()
        .where('gameId', gameId)
        .preload('player')
        .preload('targetPlayer')
        .orderBy('createdAt', 'asc')

      return response.json({
        success: true,
        moves: moves.map(move => ({
          id: move.id,
          position: move.position,
          hit: move.hit,
          shipDestroyed: move.shipDestroyed,
          player: move.player.username,
          targetPlayer: move.targetPlayer.username,
          createdAt: move.createdAt
        }))
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener movimientos',
        error: error.message
      })
    }
  }

  /**
   * Obtener estadísticas de un usuario
   */
  async getUserStats({ params, response }: HttpContext) {
    try {
      const userId = params.userId
      
      // Obtener juegos ganados y perdidos
      const wonGames = await Game.query()
        .where('winnerId', userId)
        .where('status', 'finished')
        .preload('players', (query) => {
          query.preload('user')
        })

      const lostGames = await Game.query()
        .where('status', 'finished')
        .whereHas('players', (query) => {
          query.where('userId', userId)
        })
        .where('winnerId', '!=', userId)
        .preload('players', (query) => {
          query.preload('user')
        })

      return response.json({
        success: true,
        stats: {
          totalGames: wonGames.length + lostGames.length,
          wonGames: wonGames.length,
          lostGames: lostGames.length,
          wonGamesList: wonGames.map(game => ({
            id: game.id,
            name: game.name,
            opponent: game.players.find(p => p.userId !== parseInt(userId))?.user.username,
            createdAt: game.createdAt
          })),
          lostGamesList: lostGames.map(game => ({
            id: game.id,
            name: game.name,
            opponent: game.players.find(p => p.userId !== parseInt(userId))?.user.username,
            createdAt: game.createdAt
          }))
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      })
    }
  }

  /**
   * Obtener detalles de un juego específico (para ver tableros finales)
   */
  async getGameDetails({ params, response }: HttpContext) {
    try {
      const gameId = params.id
      
      const game = await Game.query()
        .where('id', gameId)
        .preload('players', (query) => {
          query.preload('user')
        })
        .firstOrFail()

      // Obtener todos los movimientos del juego
      const moves = await GameMove.query()
        .where('gameId', gameId)
        .preload('player')
        .preload('targetPlayer')
        .orderBy('createdAt', 'asc')

      // Obtener el último movimiento para el estado final
      const lastMove = moves[moves.length - 1]
      
      let finalBoardState = null
      if (lastMove && lastMove.finalBoardState) {
        const lastBoardState = JSON.parse(lastMove.finalBoardState)
        
        // Obtener los tableros de ambos jugadores
        const players = await GamePlayer.query()
          .where('gameId', gameId)
          .preload('user')

        const player1 = players[0]
        const player2 = players[1]
        
        const player1Board = JSON.parse(player1.board)
        const player2Board = JSON.parse(player2.board)

        // Crear tableros finales mostrando todos los barcos y disparos
        finalBoardState = {
          player1Board: player1Board,
          player2Board: player2Board,
          player1Username: player1.user.username,
          player2Username: player2.user.username
        }
      }

      return response.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          status: game.status,
          winnerId: game.winnerId,
          players: game.players.map(player => ({
            id: player.userId,
            username: player.user.username,
            shipsRemaining: player.shipsRemaining
          })),
          finalBoardState: finalBoardState,
          moves: moves.map(move => ({
            id: move.id,
            position: move.position,
            hit: move.hit,
            shipDestroyed: move.shipDestroyed,
            player: move.player.username,
            targetPlayer: move.targetPlayer.username,
            createdAt: move.createdAt
          }))
        }
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Juego no encontrado'
      })
    }
  }
} 