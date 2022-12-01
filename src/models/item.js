'use strict';
module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define(
    'Item',
    {
      itemId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        field: 'id',
      },
      itemName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'item_name',
      },
      itemCategory: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'item_category',
      },
      itemType: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'item_type',
      },
      itemImage: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'item_image',
      },
      itemDesc: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'item_desc',
      },
      status: {
        type: DataTypes.ENUM('inStock', 'onTrading', 'outOfStock'),
        defaultValue: 'inStock',
      },
      openChat: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'open_chat',
      },
    },
    {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      underscored: true,
      paranoid: true,
      freezeTableName: true,
      tableName: 'item',
    }
  );
  Item.associate = function (models) {
    Item.hasMany(models.Dibs, {
      foreignKey: 'itemId',
      as: 'dibs',
    });
    Item.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };
  return Item;
};
