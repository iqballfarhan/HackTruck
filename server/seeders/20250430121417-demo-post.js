"use strict";
const fs = require("fs").promises;
module.exports = {
  async up(queryInterface, Sequelize) {
    const posts = JSON.parse(
      await fs.readFile("./data/posts.json", "utf8")
    ).map((el) => {
      return el;
    });
    await queryInterface.bulkInsert("Posts", posts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Posts", null, {});
  },
};
