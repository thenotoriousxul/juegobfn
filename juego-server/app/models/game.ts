import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import GamePlayer from './game_player.js'
import GameMove from './game_move.js'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare status: 'waiting' | 'active' | 'finished'

  @column()
  declare winnerId: number | null

  @column()
  declare creatorId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'creatorId',
  })
  declare creator: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'winnerId',
  })
  declare winner: BelongsTo<typeof User>

  @hasMany(() => GamePlayer)
  declare players: HasMany<typeof GamePlayer>

  @hasMany(() => GameMove)
  declare moves: HasMany<typeof GameMove>
} 