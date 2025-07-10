import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_players'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('game_id').unsigned().references('id').inTable('games').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.text('board').notNullable() // JSON del tablero
      table.integer('ships_remaining').defaultTo(15)
      table.boolean('is_current_turn').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      // Un usuario solo puede estar una vez en un juego
      table.unique(['game_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
} 