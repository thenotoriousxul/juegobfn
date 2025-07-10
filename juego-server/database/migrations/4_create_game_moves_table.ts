import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_moves'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('game_id').unsigned().references('id').inTable('games').notNullable()
      table.integer('player_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('target_player_id').unsigned().references('id').inTable('users').notNullable()
      table.string('position', 3).notNullable() // Ejemplo: "A3"
      table.boolean('hit').notNullable()
      table.boolean('ship_destroyed').defaultTo(false)
      table.text('final_board_state').notNullable() // JSON del estado final
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
} 