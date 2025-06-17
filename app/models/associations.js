const Cliente = require('#models/Cliente');
const Agendamento = require('#models/Agendamento');
const Ensaio = require('#models/Ensaio');
const Foto = require('#models/Foto');
const Payment = require('#models/Payment');
const Plan = require('#models/Plan');

// Associações Cliente
Cliente.hasMany(Agendamento, { foreignKey: 'clienteId', as: 'agendamentos' });
Cliente.hasMany(Payment, { foreignKey: 'clienteId', as: 'payments' });

// Associações Agendamento
Agendamento.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
Agendamento.hasOne(Ensaio, { foreignKey: 'agendamentoId', as: 'ensaio' });
Agendamento.hasMany(Payment, { foreignKey: 'agendamentoId', as: 'payments' });

// Associações Ensaio
Ensaio.belongsTo(Agendamento, { foreignKey: 'agendamentoId', as: 'agendamento' });
Ensaio.hasMany(Foto, { foreignKey: 'ensaioId', as: 'fotos' });

// Associações Foto
Foto.belongsTo(Ensaio, { foreignKey: 'ensaioId', as: 'ensaio' });

// Associações Payment
Payment.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
Payment.belongsTo(Agendamento, { foreignKey: 'agendamentoId', as: 'agendamento' });
Payment.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

// Associações Plan
Plan.hasMany(Payment, { foreignKey: 'planId', as: 'payments' });

module.exports = {
  Cliente,
  Agendamento,
  Ensaio,
  Foto,
  Payment,
  Plan
};

