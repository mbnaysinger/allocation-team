import React, { useState, useEffect } from 'react';
import Button from './Button';
import { X, Database, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { getPessoas, getProjetos, getAtividadesSemana } from '../../lib/firestore';
import { transactionLogger } from '../../lib/logger';
import { Pessoa, Projeto, AtividadeCompleta } from '../../types/allocation';

interface FirebaseDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DebugData {
  pessoas: Pessoa[];
  projetos: Projeto[];
  atividades: AtividadeCompleta[];
  lastUpdate: string;
}

const FirebaseDebugger: React.FC<FirebaseDebuggerProps> = ({ isOpen, onClose }) => {
  const [debugData, setDebugData] = useState<DebugData>({
    pessoas: [],
    projetos: [],
    atividades: [],
    lastUpdate: ''
  });
  const [loading, setLoading] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  const fetchDebugData = async () => {
    const transactionId = transactionLogger.startTransaction('fetchDebugData');
    
    setLoading(true);
    try {
      transactionLogger.logOperation('Iniciando busca de dados para debug');
      
      const [pessoas, projetos, atividades] = await Promise.all([
        getPessoas(),
        getProjetos(),
        getAtividadesSemana(
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        )
      ]);

      const newDebugData = {
        pessoas,
        projetos,
        atividades,
        lastUpdate: new Date().toISOString()
      };

      setDebugData(newDebugData);
      
      transactionLogger.successTransaction(transactionId, 'fetchDebugData', {
        pessoasCount: pessoas.length,
        projetosCount: projetos.length,
        atividadesCount: atividades.length
      });
    } catch (error) {
      transactionLogger.errorTransaction(transactionId, 'fetchDebugData', error);
      console.error('Erro ao buscar dados para debug:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDebugData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg/95 backdrop-blur-md rounded-xl border border-accent/20 shadow-glass w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-accent/20">
          <div className="flex items-center gap-3">
            <Database size={20} className="text-accent" />
            <h2 className="text-xl font-semibold text-text-light">
              Firebase Debugger
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowRawData(!showRawData)}
              variant="outline"
              size="sm"
              className="p-2"
            >
              {showRawData ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
            <Button
              onClick={fetchDebugData}
              variant="outline"
              size="sm"
              className="p-2"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="p-2"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h3 className="font-semibold text-text-light mb-2">Pessoas</h3>
              <p className="text-2xl font-bold text-accent">{debugData.pessoas.length}</p>
              <p className="text-sm text-accent/60">Total de pessoas ativas</p>
            </div>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h3 className="font-semibold text-text-light mb-2">Projetos</h3>
              <p className="text-2xl font-bold text-accent">{debugData.projetos.length}</p>
              <p className="text-sm text-accent/60">Total de projetos ativos</p>
            </div>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h3 className="font-semibold text-text-light mb-2">Atividades</h3>
              <p className="text-2xl font-bold text-accent">{debugData.atividades.length}</p>
              <p className="text-sm text-accent/60">Total de atividades da semana</p>
            </div>
          </div>

          {/* Last Update */}
          <div className="mb-6">
            <p className="text-sm text-accent/60">
              Última atualização: {debugData.lastUpdate ? new Date(debugData.lastUpdate).toLocaleString('pt-BR') : 'Nunca'}
            </p>
          </div>

          {/* Raw Data */}
          {showRawData && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text-light mb-2">Dados Brutos (JSON)</h3>
                <div className="bg-black/20 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-text-light/80">
                    {JSON.stringify(debugData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Data */}
          {!showRawData && (
            <div className="space-y-6">
              {/* Pessoas */}
              <div>
                <h3 className="font-semibold text-text-light mb-3">Pessoas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {debugData.pessoas.map((pessoa, index) => (
                    <div key={pessoa.id || index} className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                      <p className="font-medium text-text-light">{pessoa.nome}</p>
                      <p className="text-sm text-accent/60">{pessoa.cargo}</p>
                      <p className="text-xs text-accent/40">ID: {pessoa.id}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projetos */}
              <div>
                <h3 className="font-semibold text-text-light mb-3">Projetos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {debugData.projetos.map((projeto, index) => (
                    <div key={projeto.id || index} className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                      <p className="font-medium text-text-light">{projeto.nome}</p>
                      <p className="text-sm text-accent/60">{projeto.descricao}</p>
                      <p className="text-xs text-accent/40">ID: {projeto.id}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Atividades */}
              <div>
                <h3 className="font-semibold text-text-light mb-3">Atividades (Últimas 10)</h3>
                <div className="space-y-2">
                  {debugData.atividades.slice(0, 10).map((atividade, index) => (
                    <div key={atividade.id || index} className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-text-light">{atividade.titulo}</p>
                          <p className="text-sm text-accent/60">
                            {atividade.pessoa?.nome} - {atividade.data} ({atividade.horas}h)
                          </p>
                        </div>
                        <span className="text-xs text-accent/40">{atividade.tipo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirebaseDebugger; 