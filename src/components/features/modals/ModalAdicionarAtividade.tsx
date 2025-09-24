import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import ContadorCaracteres from '@/components/ui/ContadorCaracteres';
import SearchableSelect, { SelectOption } from '@/components/ui/SearchableSelect'; // Importar o novo componente
import { X } from 'lucide-react';
import { TIPOS_ATIVIDADE, DadosAtividade, Pessoa, Projeto, TipoAtividade } from '@/backend/core/models';

interface ModalAdicionarAtividadeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: DadosAtividade) => Promise<void>;
  pessoas: Pessoa[];
  projetos: Projeto[];
  dataSelecionada: string;
  pessoaSelecionada?: Pessoa | null;
  loading?: boolean;
}

const ModalAdicionarAtividade: React.FC<ModalAdicionarAtividadeProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pessoas,
  projetos,
  dataSelecionada,
  pessoaSelecionada,
  loading = false
}) => {
  const [formData, setFormData] = useState<DadosAtividade>({
    titulo: '',
    data: dataSelecionada,
    pessoaId: pessoaSelecionada?.id || '',
    tipo: 'Melhoria',
    projetoId: '',
    descricaoJira: '',
    horas: 8,
    status: 'planejada'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [colaboradores, setColaboradores] = useState<SelectOption[]>([]);

  // Atualizar formData quando dataSelecionada ou pessoaSelecionada mudarem
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      data: dataSelecionada,
      pessoaId: pessoaSelecionada?.id || ''
    }));
  }, [dataSelecionada, pessoaSelecionada]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const newErrors: Record<string, string> = {};
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }
    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }
    if (!formData.pessoaId) {
      newErrors.pessoaId = 'Pessoa é obrigatória';
    }
    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }
    if (formData.tipo === 'Projeto' && !formData.projetoId) {
      newErrors.projetoId = 'Projeto é obrigatório quando tipo é "Projeto"';
    }
    if (formData.descricaoJira && formData.descricaoJira.length > 100) {
      newErrors.descricaoJira = 'Descrição deve ter no máximo 100 caracteres';
    }
    if (!formData.horas || formData.horas <= 0) {
      newErrors.horas = 'Horas deve ser um número positivo';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const dadosParaSubmit: DadosAtividade = {
        ...formData,
        colaboradoresIds: colaboradores.map(c => c.value),
      };
      await onSubmit(dadosParaSubmit);
      handleClose();
    } catch {
      // Erro será tratado pelo componente pai
    }
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      data: dataSelecionada,
      pessoaId: pessoaSelecionada?.id || '',
      tipo: 'Melhoria',
      projetoId: '',
      descricaoJira: '',
      horas: 8,
      status: 'planejada'
    });
    setErrors({});
    setColaboradores([]);
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

  // Formatar projetos para o SearchableSelect
  const projectOptions: SelectOption[] = projetos.map(p => ({
    value: p.id,
    label: `${p.abreviatura} - ${p.nome}`
  }));

  const selectedProject = projectOptions.find(p => p.value === formData.projetoId) || null;

  const colaboradorOptions: SelectOption[] = pessoas
    .filter(p => p.id !== pessoaSelecionada?.id)
    .map(p => ({
      value: p.id,
      label: p.nome,
    }));


  return (
    <div className="fixed inset-0 bg-overlay/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-600 shadow-glass max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-xl font-semibold text-white">
            Adicionar Atividade
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
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-white mb-2">
              Título *
            </label>
            <input
              type="text"
              id="titulo"
              value={formData.titulo}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, titulo: e.target.value }));
                clearError('titulo');
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.titulo ? 'border-red-500' : 'border-slate-600'
                }`}
              placeholder="Título da atividade"
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-white mb-2">
              Data *
            </label>
            <input
              type="date"
              id="data"
              value={formData.data}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, data: e.target.value }));
                clearError('data');
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.data ? 'border-red-500' : 'border-slate-600'
                }`}
            />
            {errors.data && (
              <p className="text-red-500 text-sm mt-1">{errors.data}</p>
            )}
          </div>

          {/* Colaboradores */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="colaboradores" className="block text-sm font-medium text-white">
                Colaboradores (Opcional)
              </label>
              <button
                type="button"
                onClick={() => {
                  if (colaboradores.length === colaboradorOptions.length) {
                    // Se todos estão selecionados, limpar
                    setColaboradores([])
                  } else {
                    // Selecionar todos
                    setColaboradores([...colaboradorOptions])
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {colaboradores.length === colaboradorOptions.length ? 'Limpar Todos' : 'Selecionar Todos'}
              </button>
            </div>
            <SearchableSelect
              id="colaboradores"
              instanceId="add-activity-colaboradores-select"
              isMulti
              options={colaboradorOptions}
              value={colaboradores}
              placeholder="Digite ou selecione..."
              onChange={(options) => setColaboradores([...options])}
            />
          </div>

          {/* Pessoa - Hidden field */}
          <input
            type="hidden"
            id="pessoaId"
            value={formData.pessoaId}
          />
          {errors.pessoaId && (
            <p className="text-red-500 text-sm mt-1">{errors.pessoaId}</p>
          )}

          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-white mb-2">
              Tipo *
            </label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  tipo: e.target.value as TipoAtividade,
                  projetoId: e.target.value === 'Projeto' ? prev.projetoId : ''
                }));
                clearError('tipo');
                clearError('projetoId');
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.tipo ? 'border-red-500' : 'border-slate-600'
                }`}
            >
              {TIPOS_ATIVIDADE.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            {errors.tipo && (
              <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>
            )}
          </div>

          {/* Projeto (condicional) */}
          {formData.tipo === 'Projeto' && (
            <div>
              <label htmlFor="projetoId" className="block text-sm font-medium text-white mb-2">
                Projeto *
              </label>
              <SearchableSelect
                id="projetoId"
                instanceId="add-activity-project-select"
                options={projectOptions}
                value={selectedProject}
                placeholder="Digite ou selecione..."
                onChange={(option) => {
                  setFormData(prev => ({ ...prev, projetoId: option?.value || '' }));
                  clearError('projetoId');
                }}
                isClearable
                isSearchable
              />
              {errors.projetoId && (
                <p className="text-red-500 text-sm mt-1">{errors.projetoId}</p>
              )}
            </div>
          )}

          {/* Descrição Jira */}
          <div>
            <label htmlFor="descricaoJira" className="block text-sm font-medium text-white mb-2">
              Descrição/Link Jira (Opcional)
            </label>
            <textarea
              id="descricaoJira"
              value={formData.descricaoJira}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, descricaoJira: e.target.value }));
                clearError('descricaoJira');
              }}
              rows={2}
              maxLength={100}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none ${errors.descricaoJira ? 'border-red-500' : 'border-slate-600'
                }`}
              placeholder="Descrição ou link do Jira"
            />
            <div className="flex justify-between items-center mt-1">
              <ContadorCaracteres texto={formData.descricaoJira || ''} limite={100} />
              {errors.descricaoJira && (
                <p className="text-red-500 text-sm">{errors.descricaoJira}</p>
              )}
            </div>
          </div>

          {/* Horas */}
          <div>
            <label htmlFor="horas" className="block text-sm font-medium text-white mb-2">
              Horas *
            </label>
            <input
              type="number"
              id="horas"
              min="1"
              max="24"
              value={formData.horas}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, horas: parseInt(e.target.value) || 0 }));
                clearError('horas');
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.horas ? 'border-red-500' : 'border-slate-600'
                }`}
            />
            {errors.horas && (
              <p className="text-red-500 text-sm mt-1">{errors.horas}</p>
            )}
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
              variant="login"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Adicionando...' : 'Adicionar Atividade'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAdicionarAtividade; 