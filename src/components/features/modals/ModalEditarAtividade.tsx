import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import ContadorCaracteres from '@/components/ui/ContadorCaracteres';
import SearchableSelect, { SelectOption } from '@/components/ui/SearchableSelect';
import { X, Trash2 } from 'lucide-react';
import { AtividadeCompleta, DadosAtividade, Pessoa, Projeto, TipoAtividade, TIPOS_ATIVIDADE } from '@/core/models';

interface ModalEditarAtividadeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (atividadeId: string, dados: Partial<DadosAtividade>) => Promise<void>;
  onDelete: (atividadeId: string) => Promise<void>;
  atividade: AtividadeCompleta | null;
  pessoas: Pessoa[];
  projetos: Projeto[];
  loading?: boolean;
}

const ModalEditarAtividade: React.FC<ModalEditarAtividadeProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  atividade,
  projetos,
  loading = false
}) => {
  const [formData, setFormData] = useState<DadosAtividade>({
    titulo: '',
    data: '',
    pessoaId: '',
    tipo: 'Projeto',
    projetoId: '',
    descricaoJira: '',
    horas: 8
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Preencher formulário quando atividade mudar
  useEffect(() => {
    if (atividade) {
      setFormData({
        titulo: atividade.titulo,
        data: atividade.data,
        pessoaId: atividade.pessoaId,
        tipo: atividade.tipo,
        projetoId: atividade.projetoId || '',
        descricaoJira: atividade.descricaoJira || '',
        horas: atividade.horas
      });
      setErrors({});
    }
  }, [atividade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!atividade) return;
    
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
      await onSubmit(atividade.id, formData);
      handleClose();
    } catch {
      // Erro será tratado pelo componente pai
    }
  };

  const handleDelete = async () => {
    if (!atividade) return;
    
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      await onDelete(atividade.id);
      handleClose();
    } catch {
      // Erro será tratado pelo componente pai
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      data: '',
      pessoaId: '',
      tipo: 'Projeto',
      projetoId: '',
      descricaoJira: '',
      horas: 8
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

  if (!isOpen || !atividade) return null;

  // Formatar projetos para o SearchableSelect
  const projectOptions: SelectOption[] = projetos.map(p => ({
    value: p.id,
    label: `${p.abreviatura} - ${p.nome}`
  }));

  const selectedProject = projectOptions.find(p => p.value === formData.projetoId) || null;

  return (
    <div className="fixed inset-0 bg-overlay/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-100/95 backdrop-blur-md rounded-xl border border-accent/20 shadow-glass max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-accent/20">
          <h2 className="text-xl font-semibold text-text-light">
            Editar Atividade
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="p-2 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
              disabled={loading || deleteLoading}
            >
              <Trash2 size={16} />
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              size="sm"
              className="p-2"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-text-light mb-2">
              Título *
            </label>
            <input
              type="text"
              id="titulo"
              value={formData.titulo}
              onChange={(e) => {
                setFormData((prev: DadosAtividade) => ({ ...prev, titulo: e.target.value }));
                clearError('titulo');
              }}
              className={`w-full px-4 py-3 bg-bg/50 border rounded-lg text-text-light placeholder-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all ${
                errors.titulo ? 'border-red-500' : 'border-accent/20'
              }`}
              placeholder="Título da atividade"
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-text-light mb-2">
              Data *
            </label>
            <input
              type="date"
              id="data"
              value={formData.data}
              onChange={(e) => {
                setFormData((prev: DadosAtividade) => ({ ...prev, data: e.target.value }));
                clearError('data');
              }}
              className={`w-full px-4 py-3 bg-bg/50 border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all ${
                errors.data ? 'border-red-500' : 'border-accent/20'
              }`}
            />
            {errors.data && (
              <p className="text-red-500 text-sm mt-1">{errors.data}</p>
            )}
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

          {/* Pessoa
          <div>
            <label htmlFor="pessoaId" className="block text-sm font-medium text-text-light mb-2">
              Pessoa *
            </label>
            <select
              id="pessoaId"
              value={formData.pessoaId}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, pessoaId: e.target.value }));
                clearError('pessoaId');
              }}
              className={`w-full px-4 py-3 bg-bg/50 border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all ${
                errors.pessoaId ? 'border-red-500' : 'border-accent/20'
              }`}
            >
              <option value="">Selecione uma pessoa</option>
              {pessoas.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome} - {pessoa.cargo}
                </option>
              ))}
            </select>
            {errors.pessoaId && (
              <p className="text-red-500 text-sm mt-1">{errors.pessoaId}</p>
            )}
          </div>
          */}

          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-text-light mb-2">
              Tipo *
            </label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => {
                const newTipo = e.target.value as TipoAtividade;
                setFormData((prev: DadosAtividade) => ({ 
                  ...prev, 
                  tipo: newTipo,
                  projetoId: newTipo === 'Projeto' ? prev.projetoId : ''
                }));
                clearError('tipo');
                clearError('projetoId');
              }}
              className={`w-full px-4 py-3 bg-bg/50 border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all ${
                errors.tipo ? 'border-red-500' : 'border-accent/20'
              }`}
            >
              {TIPOS_ATIVIDADE.map((tipo: TipoAtividade) => (
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
              <label htmlFor="projetoId" className="block text-sm font-medium text-text-light mb-2">
                Projeto *
              </label>
              <SearchableSelect
                id="projetoId"
                instanceId="edit-activity-project-select"
                options={projectOptions}
                value={selectedProject}
                onChange={(option) => {
                  setFormData((prev: DadosAtividade) => ({ ...prev, projetoId: option?.value || '' }));
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
            <label htmlFor="descricaoJira" className="block text-sm font-medium text-text-light mb-2">
              Descrição/Link Jira (Opcional)
            </label>
            <textarea
              id="descricaoJira"
              value={formData.descricaoJira}
              onChange={(e) => {
                setFormData((prev: DadosAtividade) => ({ ...prev, descricaoJira: e.target.value }));
                clearError('descricaoJira');
              }}
              rows={2}
              maxLength={100}
              className={`w-full px-4 py-3 bg-bg/50 border rounded-lg text-text-light placeholder-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all resize-none ${
                errors.descricaoJira ? 'border-red-500' : 'border-accent/20'
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
            <label htmlFor="horas" className="block text-sm font-medium text-text-light mb-2">
              Horas *
            </label>
            <input
              type="number"
              id="horas"
              min="1"
              max="24"
              value={formData.horas}
              onChange={(e) => {
                setFormData((prev: DadosAtividade) => ({ ...prev, horas: parseInt(e.target.value) || 0 }));
                clearError('horas');
              }}
              className={`w-full px-4 py-3 bg-bg/50 border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all ${
                errors.horas ? 'border-red-500' : 'border-accent/20'
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
              disabled={loading || deleteLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading || deleteLoading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarAtividade; 