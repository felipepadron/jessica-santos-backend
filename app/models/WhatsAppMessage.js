const { DataTypes } = require('sequelize');
const sequelize = require('#configs/database');

const WhatsAppMessage = sequelize.define('WhatsAppMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'ID único da mensagem do WhatsApp'
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Número do remetente'
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Número do destinatário'
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Conteúdo da mensagem'
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'document', 'audio', 'video', 'location'),
    defaultValue: 'text',
    comment: 'Tipo da mensagem'
  },
  direction: {
    type: DataTypes.ENUM('inbound', 'outbound'),
    allowNull: false,
    comment: 'Direção da mensagem'
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed'),
    defaultValue: 'pending',
    comment: 'Status da mensagem'
  },
  templateName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nome do template usado (se aplicável)'
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Clientes',
      key: 'id'
    },
    comment: 'ID do cliente relacionado'
  },
  agendamentoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Agendamentos',
      key: 'id'
    },
    comment: 'ID do agendamento relacionado'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Metadados adicionais da mensagem'
  },
  isAutomated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se a mensagem foi enviada automaticamente'
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora agendada para envio'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora de envio'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora de entrega'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora de leitura'
  }
}, {
  tableName: 'whatsapp_messages',
  timestamps: true,
  indexes: [
    {
      fields: ['from']
    },
    {
      fields: ['to']
    },
    {
      fields: ['clienteId']
    },
    {
      fields: ['agendamentoId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = WhatsAppMessage;

