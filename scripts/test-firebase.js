const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, orderBy } = require('firebase/firestore');

// Configuração do Firebase (substitua pelas suas credenciais)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebasePersistence() {
  console.log('🧪 Iniciando testes de persistência no Firebase...\n');

  try {
    // Teste 1: Criar uma pessoa de teste
    console.log('📝 Teste 1: Criando pessoa de teste...');
    const pessoaTeste = {
      nome: 'Pessoa Teste ' + Date.now(),
      cargo: 'Analista de TI',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const pessoasRef = collection(db, 'pessoas');
    const pessoaDoc = await addDoc(pessoasRef, pessoaTeste);
    console.log('✅ Pessoa criada com sucesso! ID:', pessoaDoc.id);

    // Teste 2: Buscar pessoas
    console.log('\n📋 Teste 2: Buscando pessoas...');
    const pessoasQuery = query(pessoasRef, where('ativo', '==', true), orderBy('nome', 'asc'));
    const pessoasSnapshot = await getDocs(pessoasQuery);
    const pessoas = pessoasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('✅ Pessoas encontradas:', pessoas.length);
    console.log('📊 Últimas 3 pessoas:', pessoas.slice(-3).map(p => ({ id: p.id, nome: p.nome, cargo: p.cargo })));

    // Teste 3: Criar um projeto de teste
    console.log('\n📝 Teste 3: Criando projeto de teste...');
    const projetoTeste = {
      nome: 'Projeto Teste ' + Date.now(),
      descricao: 'Projeto para teste de persistência',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const projetosRef = collection(db, 'projetos');
    const projetoDoc = await addDoc(projetosRef, projetoTeste);
    console.log('✅ Projeto criado com sucesso! ID:', projetoDoc.id);

    // Teste 4: Buscar projetos
    console.log('\n📋 Teste 4: Buscando projetos...');
    const projetosQuery = query(projetosRef, where('ativo', '==', true), orderBy('nome', 'asc'));
    const projetosSnapshot = await getDocs(projetosQuery);
    const projetos = projetosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('✅ Projetos encontrados:', projetos.length);
    console.log('📊 Últimos 3 projetos:', projetos.slice(-3).map(p => ({ id: p.id, nome: p.nome, descricao: p.descricao })));

    // Teste 5: Criar uma atividade de teste
    console.log('\n📝 Teste 5: Criando atividade de teste...');
    const atividadeTeste = {
      pessoaId: pessoaDoc.id,
      projetoId: projetoDoc.id,
      descricao: 'Atividade de teste ' + Date.now(),
      tipo: 'Projeto',
      data: new Date().toISOString().split('T')[0],
      horas: 8,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const atividadesRef = collection(db, 'atividades');
    const atividadeDoc = await addDoc(atividadesRef, atividadeTeste);
    console.log('✅ Atividade criada com sucesso! ID:', atividadeDoc.id);

    // Teste 6: Buscar atividades
    console.log('\n📋 Teste 6: Buscando atividades...');
    const atividadesQuery = query(atividadesRef, orderBy('data', 'desc'));
    const atividadesSnapshot = await getDocs(atividadesQuery);
    const atividades = atividadesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('✅ Atividades encontradas:', atividades.length);
    console.log('📊 Últimas 3 atividades:', atividades.slice(0, 3).map(a => ({ 
      id: a.id, 
      descricao: a.descricao, 
      data: a.data, 
      horas: a.horas 
    })));

    console.log('\n🎉 Todos os testes passaram! Firebase está funcionando corretamente.');
    console.log('\n📊 Resumo:');
    console.log(`   - Pessoas: ${pessoas.length}`);
    console.log(`   - Projetos: ${projetos.length}`);
    console.log(`   - Atividades: ${atividades.length}`);

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error('Stack:', error.stack);
  }
}

// Executar os testes
testFirebasePersistence(); 