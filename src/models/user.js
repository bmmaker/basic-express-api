'use strict';
import bcrypt from 'bcryptjs';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        field: 'id',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        set(value) {
          if (value.length >= 1) {
            this.setDataValue('password', bcrypt.hashSync(value, 10));
          } else {
            throw new Error('Password should be at least 1 characters long!');
          }
        },
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'profile_image',
      },
      userDesc: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_desc',
      },
    },
    {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      underscored: true,
      paranoid: true,
      freezeTableName: true,
      tableName: 'user',
    }
  );

  User.prototype.isValidPassword = async function (pw) {
    try {
      return await bcrypt.compare(pw, this.password);
    } catch (err) {
      throw new Error(err);
    }
  };

  User.associate = function (models) {
    User.hasMany(models.Item, {
      foreignKey: 'userId',
      as: 'item',
    });
    User.hasMany(models.Dibs, {
      foreignKey: 'userId',
      as: 'dibs',
    });
  };
  return User;
};
