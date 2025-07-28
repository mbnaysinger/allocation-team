import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Pessoa, Projeto, Atividade, AtividadeCompleta, DadosPessoa, DadosProjeto, DadosAtividade } from '../types/allocation';

// ==================== PESSOAS ====================
export const getPessoas = async (): Promise<Pessoa[]> => {
  try {
    const pessoasRef = collection(db, 'pessoas');
    const q = query(pessoasRef, where('ativo', '==', true), orderBy('nome', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pessoa[];
  } catch (error) {
    console.error('Erro ao buscar pessoas:', error);
    throw error;
  }
};

export const criarPessoa = async (dadosPessoa: DadosPessoa): Promise<string> => {
  try {
    const pessoasRef = collection(db, 'pessoas');
    const docRef = await addDoc(pessoasRef, {
      ...dadosPessoa,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    throw error;
  }
};

export const atualizarPessoa = async (pessoaId: string, dadosAtualizados: Partial<DadosPessoa>): Promise<void> => {
  try {
    const pessoaRef = doc(db, 'pessoas', pessoaId);
    await updateDoc(pessoaRef, {
      ...dadosAtualizados,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    throw error;
  }
};

export const deletarPessoa = async (pessoaId: string): Promise<void> => {
  try {
    const pessoaRef = doc(db, 'pessoas', pessoaId);
    await updateDoc(pessoaRef, {
      ativo: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);
    throw error;
  }
};

// ==================== PROJETOS ====================
export const getProjetos = async (): Promise<Projeto[]> => {
  try {
    const projetosRef = collection(db, 'projetos');
    const q = query(projetosRef, where('ativo', '==', true), orderBy('nome', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Projeto[];
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    throw error;
  }
};

export const criarProjeto = async (dadosProjeto: DadosProjeto): Promise<string> => {
  try {
    const projetosRef = collection(db, 'projetos');
    const docRef = await addDoc(projetosRef, {
      ...dadosProjeto,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    throw error;
  }
};

export const atualizarProjeto = async (projetoId: string, dadosAtualizados: Partial<DadosProjeto>): Promise<void> => {
  try {
    const projetoRef = doc(db, 'projetos', projetoId);
    await updateDoc(projetoRef, {
      ...dadosAtualizados,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    throw error;
  }
};

export const deletarProjeto = async (projetoId: string): Promise<void> => {
  try {
    const projetoRef = doc(db, 'projetos', projetoId);
    await updateDoc(projetoRef, {
      ativo: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    throw error;
  }
};

// ==================== ATIVIDADES ====================
export const getAtividadesSemana = async (dataInicio: string, dataFim: string): Promise<AtividadeCompleta[]> => {
  try {
    const atividadesRef = collection(db, 'atividades');
    const q = query(
      atividadesRef,
      where('data', '>=', dataInicio),
      where('data', '<=', dataFim),
      orderBy('data'),
      orderBy('pessoaId')
    );
    
    const snapshot = await getDocs(q);
    const atividades = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Atividade[];

    // Buscar dados das pessoas e projetos relacionados
    const pessoasIds = [...new Set(atividades.map(a => a.pessoaId))];
    const projetosIds = [...new Set(atividades.filter(a => a.projetoId).map(a => a.projetoId!))];
    
    const pessoas = await Promise.all(
      pessoasIds.map(async (id) => {
        const pessoaDoc = await getDoc(doc(db, 'pessoas', id));
        return { id, ...pessoaDoc.data() } as Pessoa;
      })
    );
    
    const projetos = await Promise.all(
      projetosIds.map(async (id) => {
        const projetoDoc = await getDoc(doc(db, 'projetos', id));
        return { id, ...projetoDoc.data() } as Projeto;
      })
    );

    // Mapear dados completos
    return atividades.map(atividade => ({
      ...atividade,
      pessoa: pessoas.find(p => p.id === atividade.pessoaId)!,
      projeto: atividade.projetoId ? projetos.find(p => p.id === atividade.projetoId) : undefined
    }));
    
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    throw error;
  }
};

export const criarAtividade = async (dadosAtividade: DadosAtividade): Promise<string> => {
  try {
    // Validação: se tipo é "Projeto", projetoId é obrigatório
    if (dadosAtividade.tipo === 'Projeto' && !dadosAtividade.projetoId) {
      throw new Error('Projeto é obrigatório quando o tipo é "Projeto"');
    }
    
    const atividadesRef = collection(db, 'atividades');
    const docRef = await addDoc(atividadesRef, {
      ...dadosAtividade,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    throw error;
  }
};

export const atualizarAtividade = async (atividadeId: string, dadosAtualizados: Partial<DadosAtividade>): Promise<void> => {
  try {
    const atividadeRef = doc(db, 'atividades', atividadeId);
    await updateDoc(atividadeRef, {
      ...dadosAtualizados,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    throw error;
  }
};

export const deletarAtividade = async (atividadeId: string): Promise<void> => {
  try {
    const atividadeRef = doc(db, 'atividades', atividadeId);
    await deleteDoc(atividadeRef);
  } catch (error) {
    console.error('Erro ao deletar atividade:', error);
    throw error;
  }
};

export const clonarAtividade = async (atividadeId: string): Promise<string> => {
  try {
    // Buscar a atividade original
    const atividadeRef = doc(db, 'atividades', atividadeId);
    const atividadeDoc = await getDoc(atividadeRef);
    
    if (!atividadeDoc.exists()) {
      throw new Error('Atividade não encontrada');
    }
    
    const atividadeData = atividadeDoc.data();
    
    // Criar uma nova atividade com os mesmos dados, mas sem o ID original
    const { id, ...dadosParaClonar } = atividadeData;
    
    const atividadesRef = collection(db, 'atividades');
    const docRef = await addDoc(atividadesRef, {
      ...dadosParaClonar,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao clonar atividade:', error);
    throw error;
  }
};

// ==================== UTILITÁRIOS ====================
export const getTotalHorasPorDia = async (pessoaId: string, data: string): Promise<number> => {
  try {
    const atividadesRef = collection(db, 'atividades');
    const q = query(
      atividadesRef,
      where('pessoaId', '==', pessoaId),
      where('data', '==', data)
    );
    
    const snapshot = await getDocs(q);
    const atividades = snapshot.docs.map(doc => doc.data());
    
    return atividades.reduce((total, atividade) => total + (atividade.horas || 0), 0);
  } catch (error) {
    console.error('Erro ao calcular total de horas:', error);
    throw error;
  }
};

export const getAtividadesPorPessoa = async (pessoaId: string, dataInicio: string, dataFim: string): Promise<Atividade[]> => {
  try {
    const atividadesRef = collection(db, 'atividades');
    const q = query(
      atividadesRef,
      where('pessoaId', '==', pessoaId),
      where('data', '>=', dataInicio),
      where('data', '<=', dataFim),
      orderBy('data')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Atividade[];
  } catch (error) {
    console.error('Erro ao buscar atividades por pessoa:', error);
    throw error;
  }
}; 