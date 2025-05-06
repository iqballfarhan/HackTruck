"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Posts", "companyName", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Posts", "description", {
      type: Sequelize.TEXT,
    });
    await queryInterface.addColumn("Posts", "estimasiWaktu", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Posts", "rating", {
      type: Sequelize.FLOAT,
    });
    await queryInterface.addColumn("Posts", "layananTambahan", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Posts", "website", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Posts", "kontak", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Posts", "companyName");
    await queryInterface.removeColumn("Posts", "description");
    await queryInterface.removeColumn("Posts", "estimasiWaktu");
    await queryInterface.removeColumn("Posts", "rating");
    await queryInterface.removeColumn("Posts", "layananTambahan");
    await queryInterface.removeColumn("Posts", "website");
    await queryInterface.removeColumn("Posts", "kontak");
  },
};
