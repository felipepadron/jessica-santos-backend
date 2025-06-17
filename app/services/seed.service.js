const { Cliente, Agendamento, Ensaio, Foto } = require('#models/associations');

module.exports = function SeedService() {
  
  const _seedUsers = async () => {
    const User = require('#models/User');
    const bcrypt = require('bcrypt');
    
    const adminUser = {
      email: 'jessica@jessicasantos.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Jéssica',
      lastName: 'Santos'
    };
    
    await User.findOrCreate({
      where: { email: adminUser.email },
      defaults: adminUser
    });
    
    console.log('✅ Usuário admin criado com sucesso');
  };
  
  const _seedClientes = async () => {
    const clientes = [
      {
        nome: 'Ana Silva',
        email: 'ana.silva@email.com',
        telefone: '(11) 99999-1111',
        endereco: 'Rua das Flores, 123 - São Paulo, SP',
        observacoes: 'Cliente gestante, primeira gravidez',
        dataNascimento: '1990-05-15'
      },
      {
        nome: 'Maria Santos',
        email: 'maria.santos@email.com',
        telefone: '(11) 99999-2222',
        endereco: 'Av. Paulista, 456 - São Paulo, SP',
        observacoes: 'Ensaio newborn para bebê que nasceu recentemente',
        dataNascimento: '1985-08-22'
      },
      {
        nome: 'Carla Mendes',
        email: 'carla.mendes@email.com',
        telefone: '(11) 99999-3333',
        endereco: 'Rua Augusta, 789 - São Paulo, SP',
        observacoes: 'Ensaio familiar com 2 filhos pequenos',
        dataNascimento: '1988-12-10'
      },
      {
        nome: 'Fernanda Costa',
        email: 'fernanda.costa@email.com',
        telefone: '(11) 99999-4444',
        endereco: 'Rua Oscar Freire, 321 - São Paulo, SP',
        observacoes: 'Ensaio corporativo para LinkedIn',
        dataNascimento: '1992-03-18'
      },
      {
        nome: 'Juliana Oliveira',
        email: 'juliana.oliveira@email.com',
        telefone: '(11) 99999-5555',
        endereco: 'Rua Consolação, 654 - São Paulo, SP',
        observacoes: 'Ensaio de casal para casamento',
        dataNascimento: '1987-11-25'
      }
    ];
    
    for (const clienteData of clientes) {
      await Cliente.findOrCreate({
        where: { email: clienteData.email },
        defaults: clienteData
      });
    }
    
    console.log('✅ Clientes criados com sucesso');
  };
  
  const _seedAgendamentos = async () => {
    const clientes = await Cliente.findAll();
    
    const agendamentos = [
      {
        clienteId: clientes[0].id,
        dataHora: '2025-06-20 14:00:00',
        tipoEnsaio: 'gestante',
        valor: 550.00,
        status: 'confirmado',
        localEnsaio: 'Estúdio Jéssica Santos',
        observacoes: 'Ensaio gestante com props especiais',
        duracao: 120
      },
      {
        clienteId: clientes[1].id,
        dataHora: '2025-06-22 10:00:00',
        tipoEnsaio: 'newborn',
        valor: 850.00,
        status: 'agendado',
        localEnsaio: 'Domicílio do cliente',
        observacoes: 'Newborn de 15 dias',
        duracao: 180
      },
      {
        clienteId: clientes[2].id,
        dataHora: '2025-06-25 16:00:00',
        tipoEnsaio: 'ensaio_familiar',
        valor: 750.00,
        status: 'realizado',
        localEnsaio: 'Parque Ibirapuera',
        observacoes: 'Família com 2 crianças pequenas',
        duracao: 150
      },
      {
        clienteId: clientes[3].id,
        dataHora: '2025-06-28 09:00:00',
        tipoEnsaio: 'corporativo',
        valor: 400.00,
        status: 'agendado',
        localEnsaio: 'Estúdio Jéssica Santos',
        observacoes: 'Fotos para LinkedIn e redes profissionais',
        duracao: 90
      },
      {
        clienteId: clientes[4].id,
        dataHora: '2025-06-30 15:00:00',
        tipoEnsaio: 'ensaio_casal',
        valor: 650.00,
        status: 'confirmado',
        localEnsaio: 'Centro histórico de SP',
        observacoes: 'Pré-wedding para casamento em julho',
        duracao: 120
      }
    ];
    
    for (const agendamentoData of agendamentos) {
      await Agendamento.findOrCreate({
        where: { 
          clienteId: agendamentoData.clienteId,
          dataHora: agendamentoData.dataHora
        },
        defaults: agendamentoData
      });
    }
    
    console.log('✅ Agendamentos criados com sucesso');
  };
  
  const _seedEnsaios = async () => {
    const agendamentos = await Agendamento.findAll();
    
    // Criar ensaios apenas para agendamentos realizados
    const agendamentosRealizados = agendamentos.filter(ag => ag.status === 'realizado');
    
    for (const agendamento of agendamentosRealizados) {
      await Ensaio.findOrCreate({
        where: { agendamentoId: agendamento.id },
        defaults: {
          agendamentoId: agendamento.id,
          dataRealizacao: agendamento.dataHora,
          localRealizado: agendamento.localEnsaio,
          observacoes: 'Ensaio realizado conforme planejado',
          statusEntrega: 'pronto',
          quantidadeFotos: 45,
          dataEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias após
          linkGaleria: `https://galeria.jessicasantos.com/ensaio_${agendamento.id}`,
          avaliacaoCliente: 5,
          comentarioCliente: 'Fotos lindas! Superou as expectativas.'
        }
      });
    }
    
    console.log('✅ Ensaios criados com sucesso');
  };
  
  const _seedAll = async () => {
    try {
      console.log('🌱 Iniciando seed do banco de dados...');
      
      await _seedUsers();
      await _seedClientes();
      await _seedAgendamentos();
      await _seedEnsaios();
      
      console.log('🎉 Seed concluído com sucesso!');
      
      // Estatísticas
      const User = require('#models/User');
      const totalUsers = await User.count();
      const totalClientes = await Cliente.count();
      const totalAgendamentos = await Agendamento.count();
      const totalEnsaios = await Ensaio.count();
      
      console.log(`📊 Estatísticas:`);
      console.log(`   • ${totalUsers} usuários`);
      console.log(`   • ${totalClientes} clientes`);
      console.log(`   • ${totalAgendamentos} agendamentos`);
      console.log(`   • ${totalEnsaios} ensaios`);
      
    } catch (error) {
      console.error('❌ Erro no seed:', error);
      throw error;
    }
  };
  
  return {
    seedAll: _seedAll,
    seedUsers: _seedUsers,
    seedClientes: _seedClientes,
    seedAgendamentos: _seedAgendamentos,
    seedEnsaios: _seedEnsaios
  };
};

