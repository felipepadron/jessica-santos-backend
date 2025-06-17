const stripe = require('stripe');
const Payment = require('#models/Payment');
const Plan = require('#models/Plan');
const Cliente = require('#models/Cliente');

const PaymentController = () => {

  // Configurar Stripe
  const configureStripe = async (req, res) => {
    try {
      const { secretKey, publishableKey, webhookSecret } = req.body;
      
      // Salvar configurações no banco ou arquivo de config
      // Por simplicidade, vamos usar variáveis de ambiente
      process.env.STRIPE_SECRET_KEY = secretKey;
      process.env.STRIPE_PUBLISHABLE_KEY = publishableKey;
      process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
      
      res.json({
        success: true,
        message: 'Stripe configurado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao configurar Stripe',
        error: error.message
      });
    }
  };

  // Configurar PagSeguro
  const configurePagSeguro = async (req, res) => {
    try {
      const { email, token, sandbox } = req.body;
      
      process.env.PAGSEGURO_EMAIL = email;
      process.env.PAGSEGURO_TOKEN = token;
      process.env.PAGSEGURO_SANDBOX = sandbox;
      
      res.json({
        success: true,
        message: 'PagSeguro configurado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao configurar PagSeguro',
        error: error.message
      });
    }
  };

  // Criar checkout Stripe
  const createStripeCheckout = async (req, res) => {
    try {
      const { planId, clienteId, successUrl, cancelUrl } = req.body;
      
      const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
      const plan = await Plan.findByPk(planId);
      const cliente = await Cliente.findByPk(clienteId);
      
      if (!plan || !cliente) {
        return res.status(404).json({
          success: false,
          message: 'Plano ou cliente não encontrado'
        });
      }

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.description
            },
            unit_amount: Math.round(plan.price * 100)
          },
          quantity: 1
        }],
        mode: plan.interval === 'one_time' ? 'payment' : 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: cliente.email,
        metadata: {
          planId: planId.toString(),
          clienteId: clienteId.toString()
        }
      });

      // Criar registro de pagamento
      await Payment.create({
        clienteId,
        planId,
        gateway: 'stripe',
        gatewayTransactionId: session.id,
        amount: plan.price,
        currency: plan.currency,
        status: 'pending',
        description: `Pagamento do plano ${plan.name}`,
        metadata: { sessionId: session.id }
      });

      res.json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar checkout',
        error: error.message
      });
    }
  };

  // Webhook Stripe
  const stripeWebhook = async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
      
      const event = stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        await Payment.update({
          status: 'completed',
          paidAt: new Date(),
          metadata: { ...session }
        }, {
          where: { gatewayTransactionId: session.id }
        });
      }

      res.json({ received: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro no webhook',
        error: error.message
      });
    }
  };

  // Listar pagamentos
  const getPayments = async (req, res) => {
    try {
      const { page = 1, limit = 10, status, gateway } = req.query;
      
      const where = {};
      if (status) where.status = status;
      if (gateway) where.gateway = gateway;

      const payments = await Payment.findAndCountAll({
        where,
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Plan, as: 'plan' }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: payments.rows,
        pagination: {
          total: payments.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(payments.count / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar pagamentos',
        error: error.message
      });
    }
  };

  // Relatório financeiro
  const getFinancialReport = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const where = {
        status: 'completed'
      };
      
      if (startDate && endDate) {
        where.paidAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const payments = await Payment.findAll({
        where,
        attributes: [
          'gateway',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['gateway']
      });

      const totalRevenue = await Payment.sum('amount', { where });
      const totalTransactions = await Payment.count({ where });

      res.json({
        success: true,
        data: {
          totalRevenue: totalRevenue || 0,
          totalTransactions: totalTransactions || 0,
          byGateway: payments
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar relatório',
        error: error.message
      });
    }
  };

  return {
    configureStripe,
    configurePagSeguro,
    createStripeCheckout,
    stripeWebhook,
    getPayments,
    getFinancialReport
  };
};

module.exports = PaymentController;

