import React, { useState, useEffect } from 'react';
import { ResumoSemanal } from '@/backend/core/models/ResumoSemanal';
import { Pessoa } from '@/backend/core/models/Pessoa';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface ModalResumoSemanalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comentario: string) => void;
  pessoa: Pessoa | null;
  resumo?: ResumoSemanal;
  loading: boolean;
}

const ModalResumoSemanal: React.FC<ModalResumoSemanalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pessoa,
  resumo,
  loading,
}) => {
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    // Atualiza o comentário no estado quando o resumo (prop) mudar
    if (resumo) {
      setComentario(resumo.comentario);
    } else {
      setComentario('');
    }
  }, [resumo]);

  if (!isOpen || !pessoa) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(comentario);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl w-full max-w-4xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Revisão da Semana
              </h2>
              <p className="text-gray-400 mt-1">
                {pessoa.nome}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              type="button"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              Espaço para descrever progressos, impedimentos, pontos de atenção e lembretes para a semana seguinte.
            </p>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Descreva aqui os destaques, impedimentos e o progresso geral da semana..."
              className="w-full h-48 p-4 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="bg-slate-800/90 px-4 py-4 flex justify-end gap-4 rounded-b-xl">
            <Button 
              type="button" 
              onClick={onClose} 
              variant="cancel" 
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="confirm" 
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Resumo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalResumoSemanal;
