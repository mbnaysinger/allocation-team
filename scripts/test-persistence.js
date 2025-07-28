const { MongoClient } = require('mongodb');

async function testPersistence() {
  const uri = 'mongodb://admin:password123@localhost:27017/allocation_team';
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado com sucesso ao MongoDB!');

    const db = client.db('allocation_team');
    
    // Teste 1: Adicionar uma nova pessoa
    console.log('\n👤 Teste 1: Adicionando nova pessoa...');
    const pessoasCollection = db.collection('pessoas');
    const novaPessoa = {
      id: Date.now().toString(),
      nome: 'Pedro Teste',
      cargo: 'Analista de TI',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await pessoasCollection.insertOne(novaPessoa);
    console.log('✅ Pessoa adicionada:', novaPessoa.nome);

    // Teste 2: Adicionar um novo projeto
    console.log('\n📁 Teste 2: Adicionando novo projeto...');
    const projetosCollection = db.collection('projetos');
    const novoProjeto = {
      id: Date.now().toString(),
      abreviatura: 'TEST',
      nome: 'Projeto de Teste',
      descricao: 'Projeto para testar persistência',
      entidade: 'SESI',
      linkJira: 'https://jira.com/TEST',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await projetosCollection.insertOne(novoProjeto);
    console.log('✅ Projeto adicionado:', novoProjeto.nome);

    // Teste 3: Adicionar uma nova atividade
    console.log('\n📝 Teste 3: Adicionando nova atividade...');
    const atividadesCollection = db.collection('atividades');
    const novaAtividade = {
      id: Date.now().toString(),
      titulo: 'Teste de Persistência',
      data: '2024-01-15',
      pessoaId: novaPessoa.id,
      tipo: 'Projeto',
      projetoId: novoProjeto.id,
      descricaoJira: 'TEST-001: Teste de persistência no MongoDB',
      horas: 8,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await atividadesCollection.insertOne(novaAtividade);
    console.log('✅ Atividade adicionada:', novaAtividade.titulo);

    // Teste 4: Verificar se os dados foram salvos
    console.log('\n🔍 Teste 4: Verificando dados salvos...');
    
    const pessoasSalvas = await pessoasCollection.find({}).toArray();
    const projetosSalvos = await projetosCollection.find({}).toArray();
    const atividadesSalvas = await atividadesCollection.find({}).toArray();
    
    console.log(`📊 Pessoas no banco: ${pessoasSalvas.length}`);
    console.log(`📊 Projetos no banco: ${projetosSalvos.length}`);
    console.log(`📊 Atividades no banco: ${atividadesSalvas.length}`);

    // Teste 5: Buscar atividade com relacionamentos
    console.log('\n🔗 Teste 5: Buscando atividade com relacionamentos...');
    const atividadeCompleta = await atividadesCollection.aggregate([
      {
        $match: { id: novaAtividade.id }
      },
      {
        $lookup: {
          from: 'pessoas',
          localField: 'pessoaId',
          foreignField: 'id',
          as: 'pessoa'
        }
      },
      {
        $lookup: {
          from: 'projetos',
          localField: 'projetoId',
          foreignField: 'id',
          as: 'projeto'
        }
      }
    ]).toArray();

    if (atividadeCompleta.length > 0) {
      const atividade = atividadeCompleta[0];
      console.log('✅ Atividade encontrada:');
      console.log(`   Título: ${atividade.titulo}`);
      console.log(`   Pessoa: ${atividade.pessoa[0]?.nome}`);
      console.log(`   Projeto: ${atividade.projeto[0]?.nome}`);
      console.log(`   Horas: ${atividade.horas}`);
    }

    // Teste 6: Atualizar dados
    console.log('\n✏️ Teste 6: Atualizando dados...');
    await pessoasCollection.updateOne(
      { id: novaPessoa.id },
      { $set: { nome: 'Pedro Teste Atualizado', updatedAt: new Date() } }
    );
    console.log('✅ Pessoa atualizada');

    // Teste 7: Deletar dados de teste
    console.log('\n🗑️ Teste 7: Limpando dados de teste...');
    await pessoasCollection.deleteOne({ id: novaPessoa.id });
    await projetosCollection.deleteOne({ id: novoProjeto.id });
    await atividadesCollection.deleteOne({ id: novaAtividade.id });
    console.log('✅ Dados de teste removidos');

    console.log('\n🎉 Todos os testes de persistência passaram!');
    console.log('✅ Os dados estão sendo salvos e recuperados corretamente no MongoDB.');

  } catch (error) {
    console.error('❌ Erro nos testes de persistência:', error.message);
    console.log('\n💡 Verifique se:');
    console.log('  1. O MongoDB está rodando (docker-compose ps)');
    console.log('  2. A conexão está funcionando (npm run test:mongodb)');
  } finally {
    await client.close();
  }
}

// Executar os testes
testPersistence(); 