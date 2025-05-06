'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if the name column exists in Users table
      const tableInfo = await queryInterface.describeTable('Users');
      const hasNameColumn = Object.keys(tableInfo).includes('name');
      
      // Prepare seed data with or without the name field
      const userData = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'driver@gmail.com',
          password: await bcrypt.hash('driver123', 10),
          role: 'driver',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'user@gmail.com',
          password: await bcrypt.hash('user123', 10),
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      // Add name field only if it exists in the table
      if (hasNameColumn) {
        userData[0].name = 'Test Driver';
        userData[1].name = 'Test User';
      }
      
      await queryInterface.bulkInsert('Users', userData, {});
    } catch (error) {
      console.error('Seeding error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  },
};