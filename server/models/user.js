'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, { foreignKey: 'driverId' });
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('driver', 'user'),
      allowNull: false,
    },
    name: DataTypes.STRING,
    googleId: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};