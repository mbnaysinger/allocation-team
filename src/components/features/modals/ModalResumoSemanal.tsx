import React, { useState, useEffect } from 'react';
import { Pessoa, ResumoSemanal } from '@/core/models';
import Button from '@/components/ui/Button';

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
    <div className="fixed inset-0 bg-overlay/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-100 rounded-xl shadow-lg w-full max-w-4xl border border-accent/20">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">
              Revisão da Semana
            </h2>
            <p className="text-accent/80 mb-4">
              Espaço descrever progressos, impedimentos, pontos de atenção e lembretes para a semana seguinte.
            </p>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Descreva aqui os destaques, impedimentos e o progresso geral da semana..."
              className="w-full h-48 p-3 bg-bg/50 border border-accent/30 rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
              required
            />
          </div>
          <div className="bg-bg/40 px-6 py-4 flex justify-end gap-4 rounded-b-xl">
            <Button type="button" onClick={onClose} variant="outline" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {loading ? 'Salvando...' : 'Salvar Resumo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalResumoSemanal;
