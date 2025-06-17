const { DataTypes } = require('sequelize');

const Plan = (sequelize) => {
  return sequelize.define('Plan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'BRL'
    },
    interval: {
      type: DataTypes.ENUM('one_time', 'daily', 'weekly', 'monthly', 'yearly'),
      defaultValue: 'one_time'
    },
    intervalCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    trialDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true
    },
    stripeProductId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stripePriceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pagseguroProductId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'plans',
    timestamps: true
  });
};

module.exports = Plan;

