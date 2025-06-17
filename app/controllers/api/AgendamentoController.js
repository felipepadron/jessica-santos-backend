const Agendamento = require('#models/Agendamento');
const Cliente = require('#models/Cliente');

module.exports = function AgendamentoController() {
  
  const _create = async (req, res) => {
    try {
      const { 
        clienteId, 
        dataHora, 
        tipoEnsaio, 
        valor, 
        localEnsaio, 
        observacoes, 
        duracao 
      } = req.body;
      
      // Verificar se cliente existe
      const cliente = await Cliente.findByPk(clienteId);
      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente não encontrado'
        });
      }
      
      const agendamento = await Agendamento.create({
        clienteId,
        dataHora,
        tipoEnsaio,
        valor,
        localEnsaio,
        observacoes,
        duracao
      });
      
      return res.status(201).json({
        message: 'Agendamento criado com sucesso',
        agendamento
      });
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _getAll = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status = '', 
        dataInicio = '', 
        dataFim = '' 
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      let whereClause = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (dataInicio && dataFim) {
        whereClause.dataHora = {
          [require('sequelize').Op.between]: [dataInicio, dataFim]
        };
      }
      
      const { count, rows } = await Agendamento.findAndCountAll({
        where: whereClause,
        include: [{
          model: Cliente,
          attributes: ['id', 'nome', 'email', 'telefone']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['dataHora', 'ASC']]
      });
      
      return res.status(200).json({
        agendamentos: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _get = async (req, res) => {
    try {
      const { id } = req.params;
      
      const agendamento = await Agendamento.findByPk(id, {
        include: [{
          model: Cliente,
          attributes: ['id', 'nome', 'email', 'telefone']
        }]
      });
      
      if (!agendamento) {
        return res.status(404).json({
          error: 'Agendamento não encontrado'
        });
      }
      
      return res.status(200).json({ agendamento });
      
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _update = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const agendamento = await Agendamento.findByPk(id);
      
      if (!agendamento) {
        return res.status(404).json({
          error: 'Agendamento não encontrado'
        });
      }
      
      await agendamento.update(updateData);
      
      return res.status(200).json({
        message: 'Agendamento atualizado com sucesso',
        agendamento
      });
      
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _updateStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const agendamento = await Agendamento.findByPk(id);
      
      if (!agendamento) {
        return res.status(404).json({
          error: 'Agendamento não encontrado'
        });
      }
      
      await agendamento.update({ status });
      
      return res.status(200).json({
        message: 'Status do agendamento atualizado com sucesso',
        agendamento
      });
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _getDisponibilidade = async (req, res) => {
    try {
      const { data } = req.query; // YYYY-MM-DD
      
      if (!data) {
        return res.status(400).json({
          error: 'Data é obrigatória'
        });
      }
      
      const agendamentos = await Agendamento.findAll({
        where: {
          dataHora: {
            [require('sequelize').Op.between]: [
              `${data} 00:00:00`,
              `${data} 23:59:59`
            ]
          },
          status: {
            [require('sequelize').Op.ne]: 'cancelado'
          }
        },
        attributes: ['dataHora', 'duracao']
      });
      
      // Horários disponíveis (9h às 18h)
      const horariosDisponiveis = [];
      for (let hora = 9; hora <= 18; hora++) {
        horariosDisponiveis.push(`${hora.toString().padStart(2, '0')}:00`);
      }
      
      // Remover horários ocupados
      const horariosOcupados = agendamentos.map(ag => {
        const hora = new Date(ag.dataHora).getHours();
        return `${hora.toString().padStart(2, '0')}:00`;
      });
      
      const horariosLivres = horariosDisponiveis.filter(
        horario => !horariosOcupados.includes(horario)
      );
      
      return res.status(200).json({
        data,
        horariosDisponiveis: horariosLivres,
        agendamentosExistentes: agendamentos.length
      });
      
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  return {
    create: _create,
    getAll: _getAll,
    get: _get,
    update: _update,
    updateStatus: _updateStatus,
    getDisponibilidade: _getDisponibilidade
  };
};

