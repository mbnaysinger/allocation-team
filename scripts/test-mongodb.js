const { MongoClient } = require('mongodb');

async function testMongoDBConnection() {
  const uri = 'mongodb://admin:password123@localhost:27017/allocation_team';
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado com sucesso ao MongoDB!');

    const db = client.db('allocation_team');
    
    // Testar listar coleções
    console.log('\n📋 Coleções disponíveis:');
    const collections = await db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    // Testar contar documentos em cada coleção
    console.log('\n📊 Contagem de documentos:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documentos`);
    }

    // Testar buscar algumas pessoas
    console.log('\n👥 Pessoas cadastradas:');
    const pessoas = await db.collection('pessoas').find({}).limit(5).toArray();
    pessoas.forEach(pessoa => {
      console.log(`  - ${pessoa.nome} (${pessoa.cargo})`);
    });

    // Testar buscar alguns projetos
    console.log('\n📁 Projetos cadastrados:');
    const projetos = await db.collection('projetos').find({}).limit(5).toArray();
    projetos.forEach(projeto => {
      console.log(`  - ${projeto.nome} (${projeto.status})`);
    });

    console.log('\n🎉 Todos os testes passaram! MongoDB está funcionando corretamente.');

  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    console.log('\n💡 Verifique se:');
    console.log('  1. O Docker está rodando');
    console.log('  2. O container MongoDB está ativo (docker-compose ps)');
    console.log('  3. A porta 27017 está disponível');
  } finally {
    await client.close();
  }
}

// Executar o teste
testMongoDBConnection(); 