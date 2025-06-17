const Plan = require('#models/Plan');

const PlanController = () => {

  // Criar plano
  const createPlan = async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        currency = 'BRL',
        interval = 'one_time',
        intervalCount = 1,
        trialDays = 0,
        features = []
      } = req.body;

      const plan = await Plan.create({
        name,
        description,
        price,
        currency,
        interval,
        intervalCount,
        trialDays,
        features
      });

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar plano',
        error: error.message
      });
    }
  };

  // Listar planos
  const getPlans = async (req, res) => {
    try {
      const { active = true } = req.query;
      
      const where = {};
      if (active !== undefined) {
        where.isActive = active === 'true';
      }

      const plans = await Plan.findAll({
        where,
        order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
      });

      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar planos',
        error: error.message
      });
    }
  };

  // Buscar plano por ID
  const getPlan = async (req, res) => {
    try {
      const { id } = req.params;
      
      const plan = await Plan.findByPk(id);
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plano não encontrado'
        });
      }

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar plano',
        error: error.message
      });
    }
  };

  // Atualizar plano
  const updatePlan = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const [updatedRows] = await Plan.update(updateData, {
        where: { id }
      });

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Plano não encontrado'
        });
      }

      const plan = await Plan.findByPk(id);

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar plano',
        error: error.message
      });
    }
  };

  // Deletar plano
  const deletePlan = async (req, res) => {
    try {
      const { id } = req.params;

      const deletedRows = await Plan.destroy({
        where: { id }
      });

      if (deletedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Plano não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Plano deletado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar plano',
        error: error.message
      });
    }
  };

  return {
    createPlan,
    getPlans,
    getPlan,
    updatePlan,
    deletePlan
  };
};

module.exports = PlanController;

