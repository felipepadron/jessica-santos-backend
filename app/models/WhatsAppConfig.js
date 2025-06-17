const { DataTypes } = require('sequelize');
const sequelize = require('#configs/database');

const WhatsAppConfig = sequelize.define('WhatsAppConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Chave da configuração'
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Valor da configuração'
  },
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string',
    comment: 'Tipo do valor'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Descrição da configuração'
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se o valor está criptografado'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Se a configuração está ativa'
  }
}, {
  tableName: 'whatsapp_configs',
  timestamps: true,
  indexes: [
    {
      fields: ['key']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = WhatsAppConfig;

