'use strict';
module.exports = (sequelize, DataTypes) => {
  const Dibs = sequelize.define(
    'Dibs',
    {
      dibsId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        field: 'id',
      },
    },
    {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      underscored: true,
      paranoid: true,
      freezeTableName: true,
      tableName: 'dibs',
    }
  );
  Dibs.associate = function (models) {
    Dibs.belongsTo(models.User, {
      foreignKey: 'userId',
    });
    Dibs.belongsTo(models.Item, {
      foreignKey: 'itemId',
    });
  };
  return Dibs;
};
