import Game from '#models/game'
import GamePlayer from '#models/game_player'
import GameMove from '#models/game_move'
import User from '#models/user'

export default class GameService {
  /**
   * Genera un tablero aleatorio 8x8 con 15 barcos
   */
  static generateRandomBoard(): string[][] {
    const board: string[][] = Array(8).fill(null).map(() => Array(8).fill('water'))
    const ships = 15
    let placedShips = 0

    while (placedShips < ships) {
      const row = Math.floor(Math.random() * 8)
      const col = Math.floor(Math.random() * 8)

      if (board[row][col] === 'water') {
        board[row][col] = 'ship'
        placedShips++
      }
    }

    return board
  }

  /**
   * Convierte coordenadas de letra+número a índices de array
   */
  static parsePosition(position: string): { row: number; col: number } | null {
    const match = position.match(/^([A-H])([1-8])$/)
    if (!match) return null

    const col = match[1].charCodeAt(0) - 65 // A=0, B=1, etc.
    const row = parseInt(match[2]) - 1 // 1=0, 2=1, etc.

    return { row, col }
  }

  /**
   * Convierte índices de array a coordenadas de letra+número
   */
  static formatPosition(row: number, col: number): string {
    const letter = String.fromCharCode(65 + col)
    const number = row + 1
    return `${letter}${number}`
  }

  /**
   * Realiza un disparo en el tablero
   */
  static makeShot(board: string[][], position: string): { hit: boolean; shipDestroyed: boolean } {
    const coords = this.parsePosition(position)
    if (!coords) {
      throw new Error('Posición inválida')
    }

    const { row, col } = coords
    const cell = board[row][col]

    if (cell === 'hit' || cell === 'miss') {
      throw new Error('Ya se ha disparado en esta posición')
    }

    const hit = cell === 'ship'
    
    if (hit) {
      board[row][col] = 'hit'
      // Verificar si el barco fue destruido (todos los barcos adyacentes también fueron golpeados)
      const shipDestroyed = this.checkShipDestroyed(board, row, col)
      return { hit: true, shipDestroyed }
    } else {
      board[row][col] = 'miss'
      return { hit: false, shipDestroyed: false }
    }
  }

  /**
   * Verifica si un barco fue completamente destruido
   */
  private static checkShipDestroyed(board: string[][], row: number, col: number): boolean {
    // Buscar todos los barcos conectados
    const connectedShips: { row: number; col: number }[] = []
    this.findConnectedShips(board, row, col, connectedShips)

    // Verificar si todos los barcos conectados fueron golpeados
    return connectedShips.every(({ row: r, col: c }) => board[r][c] === 'hit')
  }

  /**
   * Encuentra todos los barcos conectados usando DFS
   */
  private static findConnectedShips(
    board: string[][], 
    row: number, 
    col: number, 
    connectedShips: { row: number; col: number }[]
  ) {
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return
    if (board[row][col] !== 'ship' && board[row][col] !== 'hit') return

    const position = { row, col }
    if (connectedShips.some(p => p.row === row && p.col === col)) return

    connectedShips.push(position)

    // Buscar en las 4 direcciones
    this.findConnectedShips(board, row - 1, col, connectedShips)
    this.findConnectedShips(board, row + 1, col, connectedShips)
    this.findConnectedShips(board, row, col - 1, connectedShips)
    this.findConnectedShips(board, row, col + 1, connectedShips)
  }

  /**
   * Cuenta los barcos restantes en el tablero
   */
  static countRemainingShips(board: string[][]): number {
    let count = 0
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === 'ship') {
          count++
        }
      }
    }
    return count
  }

  /**
   * Crea un nuevo juego
   */
  static async createGame(name: string, creatorId: number): Promise<Game> {
    const game = await Game.create({
      name,
      creatorId,
      status: 'waiting'
    })

    return game
  }

  /**
   * Une un jugador a un juego
   */
  static async joinGame(gameId: number, userId: number): Promise<GamePlayer> {
    const game = await Game.findOrFail(gameId)
    
    if (game.status !== 'waiting') {
      throw new Error('El juego ya no está esperando jugadores')
    }

    const existingPlayer = await GamePlayer.query()
      .where('gameId', gameId)
      .where('userId', userId)
      .first()

    if (existingPlayer) {
      throw new Error('Ya estás en este juego')
    }

    const playerCount = await GamePlayer.query().where('gameId', gameId).count('* as total')
    if (playerCount[0].$extras.total >= 2) {
      throw new Error('El juego ya tiene 2 jugadores')
    }

    const board = this.generateRandomBoard()
    const isFirstPlayer = playerCount[0].$extras.total === 0

    const gamePlayer = await GamePlayer.create({
      gameId,
      userId,
      board: JSON.stringify(board),
      shipsRemaining: 15,
      isCurrentTurn: isFirstPlayer
    })

    // Si es el segundo jugador, iniciar el juego
    if (!isFirstPlayer) {
      await game.merge({ status: 'active' }).save()
    }

    return gamePlayer
  }

  /**
   * Realiza un movimiento en el juego
   */
  static async makeMove(gameId: number, playerId: number, targetPosition: string): Promise<any> {
    const game = await Game.findOrFail(gameId)
    if (game.status !== 'active') {
      throw new Error('El juego no está activo')
    }

    const currentPlayer = await GamePlayer.query()
      .where('gameId', gameId)
      .where('userId', playerId)
      .firstOrFail()

    if (!currentPlayer.isCurrentTurn) {
      throw new Error('No es tu turno')
    }

    const opponent = await GamePlayer.query()
      .where('gameId', gameId)
      .where('userId', '!=', playerId)
      .firstOrFail()

    const opponentBoard = JSON.parse(opponent.board)
    const result = this.makeShot(opponentBoard, targetPosition)

    // Actualizar el tablero del oponente
    opponent.board = JSON.stringify(opponentBoard)
    opponent.shipsRemaining = this.countRemainingShips(opponentBoard)
    await opponent.save()

    // Registrar el movimiento
    await GameMove.create({
      gameId,
      playerId,
      targetPlayerId: opponent.userId,
      position: targetPosition,
      hit: result.hit,
      shipDestroyed: result.shipDestroyed,
      finalBoardState: JSON.stringify(opponentBoard)
    })

    // Cambiar turno
    currentPlayer.isCurrentTurn = false
    opponent.isCurrentTurn = true
    await currentPlayer.save()
    await opponent.save()

    // Verificar si el juego terminó
    if (opponent.shipsRemaining === 0) {
      await game.merge({ 
        status: 'finished', 
        winnerId: playerId 
      }).save()

      // Actualizar estadísticas
      const winner = await User.findOrFail(playerId)
      const loser = await User.findOrFail(opponent.userId)
      
      winner.gamesWon++
      loser.gamesLost++
      
      await winner.save()
      await loser.save()
    }

    return {
      hit: result.hit,
      shipDestroyed: result.shipDestroyed,
      gameFinished: opponent.shipsRemaining === 0,
      winner: opponent.shipsRemaining === 0 ? playerId : null
    }
  }

  /**
   * Obtiene el estado actual del juego
   */
  static async getGameState(gameId: number, userId: number): Promise<any> {
    const game = await Game.findOrFail(gameId)
    const players = await GamePlayer.query()
      .where('gameId', gameId)
      .preload('user')

    const currentPlayer = players.find(p => p.userId === userId)
    const opponent = players.find(p => p.userId !== userId)

    if (!currentPlayer || !opponent) {
      throw new Error('Jugador no encontrado en el juego')
    }

    const currentPlayerBoard = JSON.parse(currentPlayer.board)
    const opponentBoard = JSON.parse(opponent.board)

    // Ocultar barcos del oponente
    const hiddenOpponentBoard = opponentBoard.map(row => 
      row.map(cell => cell === 'ship' ? 'water' : cell)
    )

    return {
      game: {
        id: game.id,
        name: game.name,
        status: game.status,
        winnerId: game.winnerId
      },
      currentPlayer: {
        id: currentPlayer.id,
        userId: currentPlayer.userId,
        username: currentPlayer.user.username,
        board: currentPlayerBoard,
        shipsRemaining: currentPlayer.shipsRemaining,
        isCurrentTurn: currentPlayer.isCurrentTurn
      },
      opponent: {
        id: opponent.id,
        userId: opponent.userId,
        username: opponent.user.username,
        board: hiddenOpponentBoard,
        shipsRemaining: opponent.shipsRemaining,
        isCurrentTurn: opponent.isCurrentTurn
      }
    }
  }
} 