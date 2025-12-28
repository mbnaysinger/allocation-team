import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

import { X } from 'lucide-react';
import { DadosPessoa, CARGOS, Cargo } from '@/backend/core/models/Pessoa';

interface ModalAdicionarPessoaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: DadosPessoa) => Promise<void>;
  loading?: boolean;
}

const ModalAdicionarPessoa: React.FC<ModalAdicionarPessoaProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<DadosPessoa>({
    nome: '',
    cargo: 'Analista de TI',
    squad: 'Desenvolvimento'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    if (!formData.cargo) {
      newErrors.cargo = 'Cargo é obrigatório';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit(formData);
      handleClose();
    } catch {
      // Erro será tratado pelo componente pai
    }
  };

  const handleClose = () => {
    setFormData({ nome: '', cargo: 'Analista de TI', squad: 'Desenvolvimento' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">
            Adicionar Pessoa
          </h2>
          <Button
            onClick={handleClose}
            variant="cancel"
            size="sm"
            className="p-2"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-white mb-2">
              Nome *
            </label>
            <input
              type="text"
              id="nome"
              value={formData.nome}
                              onChange={(e) => {
                  setFormData(prev => ({ ...prev, nome: e.target.value }));
                  if (errors.nome) setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.nome;
                    return newErrors;
                  });
                }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
                errors.nome ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Digite o nome completo"
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
            )}
          </div>

          {/* Cargo */}
          <div>
            <label htmlFor="cargo" className="block text-sm font-medium text-white mb-2">
              Cargo *
            </label>
            <select
              id="cargo"
              value={formData.cargo}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, cargo: e.target.value as Cargo }));
                if (errors.cargo) setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.cargo;
                  return newErrors;
                });
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
                errors.cargo ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              {CARGOS.map((cargo) => (
                <option key={cargo} value={cargo}>
                  {cargo}
                </option>
              ))}
            </select>
            {errors.cargo && (
              <p className="text-red-500 text-sm mt-1">{errors.cargo}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="cancel"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="login"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Adicionando...' : 'Adicionar Pessoa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAdicionarPessoa; 