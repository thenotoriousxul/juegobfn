import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Game from './game.js'

export default class GamePlayer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare gameId: number

  @column()
  declare userId: number

  @column()
  declare board: string // JSON string del tablero 8x8 con posiciones de barcos

  @column()
  declare shipsRemaining: number

  @column()
  declare isCurrentTurn: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Game, {
    foreignKey: 'gameId',
  })
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>
} 