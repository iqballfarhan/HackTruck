"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, { foreignKey: "driverId" });
    }
  }
  Post.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      departureDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      origin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      destination: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      truckType: {
        type: DataTypes.ENUM("pickup", "box", "flatbed", "refrigerated"),
        allowNull: false,
      },
      maxWeight: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imageUrl: DataTypes.STRING,
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      mapEmbedUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      driverId: {
        type: DataTypes.UUID,
        references: {
          model: "Users",
          key: "id",
        },
      },
      companyName: DataTypes.STRING,
      description: DataTypes.TEXT,
      estimasiWaktu: DataTypes.STRING,
      rating: DataTypes.FLOAT,
      layananTambahan: DataTypes.STRING,
      website: DataTypes.STRING,
      kontak: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Post",
    }
  );
  return Post;
};
