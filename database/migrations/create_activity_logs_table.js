'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, STRING, JSON, DATE } = Sequelize

    await queryInterface.createTable('activity_logs', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      log_name: { type: STRING, defaultValue: 'default' },
      description: { type: STRING },
      subject_id: { type: INTEGER },
      subject_type: { type: STRING },
      causer_id: { type: INTEGER },
      causer_type: { type: STRING },
      properties: { type: JSON },
      created_at: { type: DATE },
      updated_at: { type: DATE }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activity_logs')
  }
}
