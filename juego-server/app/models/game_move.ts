import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Game from './game.js'
import User from './user.js'

export default class GameMove extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare gameId: number

  @column()
  declare playerId: number

  @column()
  declare targetPlayerId: number

  @column()
  declare position: string // Ejemplo: "A3"

  @column()
  declare hit: boolean

  @column()
  declare shipDestroyed: boolean

  @column()
  declare finalBoardState: string // JSON del estado final del tablero

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Game, {
    foreignKey: 'gameId',
  })
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => User, {
    foreignKey: 'playerId',
  })
  declare player: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'targetPlayerId',
  })
  declare targetPlayer: BelongsTo<typeof User>
} 