const Cliente = require('#models/Cliente');

module.exports = function ClienteController() {
  
  const _create = async (req, res) => {
    try {
      const { nome, email, telefone, endereco, observacoes, dataNascimento } = req.body;
      
      const cliente = await Cliente.create({
        nome,
        email,
        telefone,
        endereco,
        observacoes,
        dataNascimento
      });
      
      return res.status(201).json({
        message: 'Cliente criado com sucesso',
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          status: cliente.status
        }
      });
      
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: 'Email já cadastrado'
        });
      }
      
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _getAll = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = search ? {
        [require('sequelize').Op.or]: [
          { nome: { [require('sequelize').Op.like]: `%${search}%` } },
          { email: { [require('sequelize').Op.like]: `%${search}%` } },
          { telefone: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      } : {};
      
      const { count, rows } = await Cliente.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        clientes: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _get = async (req, res) => {
    try {
      const { id } = req.params;
      
      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente não encontrado'
        });
      }
      
      return res.status(200).json({ cliente });
      
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _update = async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, email, telefone, endereco, observacoes, dataNascimento, status } = req.body;
      
      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente não encontrado'
        });
      }
      
      await cliente.update({
        nome,
        email,
        telefone,
        endereco,
        observacoes,
        dataNascimento,
        status
      });
      
      return res.status(200).json({
        message: 'Cliente atualizado com sucesso',
        cliente
      });
      
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: 'Email já cadastrado'
        });
      }
      
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _destroy = async (req, res) => {
    try {
      const { id } = req.params;
      
      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente não encontrado'
        });
      }
      
      await cliente.destroy();
      
      return res.status(200).json({
        message: 'Cliente deletado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
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
    destroy: _destroy
  };
};

