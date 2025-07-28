import React, { useState } from 'react';
import Button from '../atoms/Button';
import { X } from 'lucide-react';
import { ENTIDADES, DadosProjeto } from '../../types/allocation';

interface ModalAdicionarProjetoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: DadosProjeto) => Promise<void>;
  loading?: boolean;
}

const ModalAdicionarProjeto: React.FC<ModalAdicionarProjetoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<DadosProjeto>({
    abreviatura: '',
    nome: '',
    descricao: '',
    entidade: undefined,
    linkJira: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    if (!formData.abreviatura.trim()) {
      newErrors.abreviatura = 'Abreviatura é obrigatória';
    }
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      // Erro será tratado pelo componente pai
    }
  };

  const handleClose = () => {
    setFormData({
      abreviatura: '',
      nome: '',
      descricao: '',
      entidade: undefined,
      linkJira: ''
    });
    setErrors({});
    onClose();
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg/95 backdrop-blur-md rounded-xl border border-accent/20 shadow-glass max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-accent/20">
          <h2 className="text-xl font-semibold text-text-light">
            Adicionar Projeto
          </h2>
          <Button
            onClick={handleClose}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Abreviatura */}
          <div>
            <label htmlFor="abreviatura" className="block text-sm font-medium text-text-light mb-2">
              Abreviatura *
            </label>
            <input
              type="text"
              id="abreviatura"
              value={formData.abreviatura}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, abreviatura: e.target.value.toUpperCase() }));
                clearError('abreviatura');
              }}
              className={`w-full px-4 py-3 bg-bg/50 border rounded-lg text-text-light placeholder-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all ${
                errors.abreviatura ? 'border-red-500' : 'border-accent/20'
              }`}
              placeholder="Ex: PROJ-001"
            />
            {errors.abreviatura && (
              <p className="text-red-500 text-sm mt-1">{errors.abreviatura}</p>
            )}
          </div>

          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-text-light mb-2">
              Nome *
            </label>
            <input
              type="text"
              id="nome"
              value={formData.nome}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, nome: e.target.value }));
                clearError('nome');
              }}
              className={`w-full px-4 py-3 bg-bg/50 border rounded-lg text-text-light placeholder-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all ${
                errors.nome ? 'border-red-500' : 'border-accent/20'
              }`}
              placeholder="Nome do projeto"
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-text-light mb-2">
              Descrição *
            </label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, descricao: e.target.value }));
                clearError('descricao');
              }}
              rows={3}
              className={`w-full px-4 py-3 bg-bg/50 border rounded-lg text-text-light placeholder-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all resize-none ${
                errors.descricao ? 'border-red-500' : 'border-accent/20'
              }`}
              placeholder="Descrição detalhada do projeto"
            />
            {errors.descricao && (
              <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>
            )}
          </div>

          {/* Entidade */}
          <div>
            <label htmlFor="entidade" className="block text-sm font-medium text-text-light mb-2">
              Entidade (Opcional)
            </label>
            <select
              id="entidade"
              value={formData.entidade || ''}
              onChange={(e) => {
                setFormData(prev => ({ 
                  ...prev, 
                  entidade: e.target.value as any || undefined 
                }));
              }}
              className="w-full px-4 py-3 bg-bg/50 border border-accent/20 rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
            >
              <option value="">Selecione uma entidade</option>
              {ENTIDADES.map((entidade) => (
                <option key={entidade} value={entidade}>
                  {entidade}
                </option>
              ))}
            </select>
          </div>

          {/* Link Jira */}
          <div>
            <label htmlFor="linkJira" className="block text-sm font-medium text-text-light mb-2">
              Link Jira (Opcional)
            </label>
            <input
              type="url"
              id="linkJira"
              value={formData.linkJira}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, linkJira: e.target.value }));
              }}
              className="w-full px-4 py-3 bg-bg/50 border border-accent/20 rounded-lg text-text-light placeholder-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
              placeholder="https://jira.empresa.com/projeto/PROJ-001"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Adicionando...' : 'Adicionar Projeto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAdicionarProjeto; 