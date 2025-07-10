import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Game from './game.js'
import GamePlayer from './game_player.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare gamesWon: number

  @column()
  declare gamesLost: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Game, {
    foreignKey: 'creatorId',
  })
  declare createdGames: HasMany<typeof Game>

  @hasMany(() => GamePlayer)
  declare gamePlayers: HasMany<typeof GamePlayer>
} 