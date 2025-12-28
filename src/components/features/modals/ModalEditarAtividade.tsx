import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import ContadorCaracteres from '@/components/ui/ContadorCaracteres';
import SearchableSelect, { SelectOption } from '@/components/ui/SearchableSelect';
import { Checkbox } from '@/components/ui/Checkbox';
import { X, Trash2 } from 'lucide-react';
import { AtividadeCompleta, DadosAtividade, TipoAtividade, TIPOS_ATIVIDADE } from '@/backend/core/models/Atividade';
import { Pessoa } from '@/backend/core/models/Pessoa';
import { Projeto } from '@/backend/core/models/projeto/Projeto';
import { hhmmToSeconds, secondsToHHMM, adjustHHMM, formatHHMM } from '@/app/utils/time';
import { getWeekString } from '@/app/utils/date';
import { parseISO } from 'date-fns';
import { UserRole } from '@/backend/core/models/UserRole';

interface ModalEditarAtividadeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (atividadeId: string, dados: Partial<DadosAtividade>) => Promise<void>;
  onDelete: (atividadeId: string) => Promise<void>;
  atividade: AtividadeCompleta | null;
  pessoas: Pessoa[];
  projetos: Projeto[];
  loading?: boolean;
  userRole: UserRole;
}

const ModalEditarAtividade: React.FC<ModalEditarAtividadeProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  atividade,
  projetos,
  loading = false,
  userRole
}) => {
  const [formData, setFormData] = useState<Omit<DadosAtividade, 'tempo' | 'tmp_executado'> & { tempo: string, tmp_executado: string, version?: number }>({
    titulo: '',
    data: '',
    pessoaId: '',
    tipo: 'Projeto',
    projetoId: '',
    descricaoJira: '',
    semana: '',
    status: 'planejada',
    tempo: '00:00',
    tmp_executado: '00:00',
    isDesvio: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isUserView = userRole === UserRole.USER;

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
        semana: atividade.semana,
        tempo: secondsToHHMM(atividade.tempo),
        tmp_executado: secondsToHHMM(atividade.tmp_executado || 0),
        status: atividade.status,
        isDesvio: atividade.isDesvio || false,
        version: atividade.version // Armazena a versão
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
    if (formData.descricaoJira && formData.descricaoJira.length > 8000) {
      newErrors.descricaoJira = 'Descrição deve ter no máximo 8000 caracteres';
    }
    const tempoEmSegundos = formData.isDesvio ? 0 : hhmmToSeconds(formData.tempo);
    if (!formData.isDesvio) {
      if (!formData.tempo || !/^\d{2}:\d{2}$/.test(formData.tempo) || tempoEmSegundos <= 0) {
        newErrors.tempo = 'Tempo é obrigatório, no formato hh:mm e deve ser maior que 00:00';
      }
    }

    const tmpExecutadoEmSegundos = hhmmToSeconds(formData.tmp_executado);
    if (!formData.tmp_executado || !/^\d{2}:\d{2}$/.test(formData.tmp_executado) || tmpExecutadoEmSegundos < 0) {
      newErrors.tmp_executado = 'Tempo executado é obrigatório, no formato hh:mm e não pode ser negativo';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const dadosParaSubmit = {
        ...formData,
        tempo: tempoEmSegundos,
        tmp_executado: tmpExecutadoEmSegundos,
        version: atividade.version // Inclui a versão atual para o backend verificar
      };
      await onSubmit(atividade.id, dadosParaSubmit);
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
      semana: '',
      status: 'planejada',
      tempo: '00:00',
      tmp_executado: '00:00'
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
    value: p.projetoId,
    label: `${p.abreviatura} - ${p.nome}`
  }));

  const selectedProject = projectOptions.find(p => p.value === formData.projetoId) || null;

  return (
    <div className="fixed inset-0 bg-overlay/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-600 shadow-glass max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-xl font-semibold text-white">
            Editar Atividade
          </h2>
          <div className="flex items-center gap-2">
            {!isUserView && (
              <>
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="p-2 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
              disabled={loading || deleteLoading || isUserView}
            >
              <Trash2 size={16} />
            </Button>
            </>
            )}
            <Button
              onClick={handleClose}
              variant="cancel"
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
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
                errors.titulo ? 'border-red-500' : 'border-slate-600'
              } ${isUserView ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Título da atividade"
              disabled={isUserView}
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
            )}
          </div>

          {/* Data */}
          {!isUserView && (
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-white mb-2">
              Data *
            </label>
            <input
              type="date"
              id="data"
              value={formData.data}
              onChange={(e) => {
                const novaData = e.target.value;
                if (novaData) {
                  const weekString = getWeekString(parseISO(novaData));
                  setFormData(prev => ({ ...prev, data: novaData, semana: weekString }));
                } else {
                  setFormData(prev => ({ ...prev, data: novaData, semana: '' }));
                }
                clearError('data');
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
                errors.data ? 'border-red-500' : 'border-slate-600'
              } ${isUserView ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {errors.data && (
              <p className="text-red-500 text-sm mt-1">{errors.data}</p>
            )}
          </div>
          )}

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
            <label htmlFor="pessoaId" className="block text-sm font-medium text-white mb-2">
              Pessoa *
            </label>
            <select
              id="pessoaId"
              value={formData.pessoaId}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, pessoaId: e.target.value }));
                clearError('pessoaId');
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
                errors.pessoaId ? 'border-red-500' : 'border-slate-600'
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
          {!isUserView && (
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-white mb-2">
              Tipo *
            </label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => {
                const newTipo = e.target.value as TipoAtividade;
                setFormData(prev => ({ 
                  ...prev, 
                  tipo: newTipo,
                  projetoId: newTipo === 'Projeto' ? prev.projetoId : ''
                }));
                clearError('tipo');
                clearError('projetoId');
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
                errors.tipo ? 'border-red-500' : 'border-slate-600'
              } ${isUserView ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          )}

          {/* Projeto (condicional) */}
          {!isUserView && formData.tipo === 'Projeto' && (
            <div>
              <label htmlFor="projetoId" className="block text-sm font-medium text-white mb-2">
                Projeto *
              </label>
              <SearchableSelect
                id="projetoId"
                instanceId="edit-activity-project-select"
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
              Descrição (Opcional)
            </label>
            <textarea
              id="descricaoJira"
              value={formData.descricaoJira}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, descricaoJira: e.target.value }));
                clearError('descricaoJira');
              }}
              rows={4}
              maxLength={8000}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none ${
                errors.descricaoJira ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Descrição ou link do Jira"
            />
            <div className="flex justify-between items-center mt-1">
              <ContadorCaracteres texto={formData.descricaoJira || ''} limite={8000} />
              {errors.descricaoJira && (
                <p className="text-red-500 text-sm">{errors.descricaoJira}</p>
              )}
            </div>
          </div>

          {/* Tempo */}
          {!formData.isDesvio && (
            <div>
              <label htmlFor="tempo" className="block text-sm font-medium text-white mb-2">
                Tempo Planejado *
              </label>
              <input
                type="text"
                id="tempo"
                value={formData.tempo}
                onChange={(e) => {
                  const formattedTime = formatHHMM(e.target.value);
                  setFormData(prev => ({ ...prev, tempo: formattedTime }));
                  clearError('tempo');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setFormData(prev => ({ ...prev, tempo: adjustHHMM(prev.tempo, 15) }));
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setFormData(prev => ({ ...prev, tempo: adjustHHMM(prev.tempo, -15) }));
                  }
                }}
                maxLength={5}
                className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.tempo ? 'border-red-500' : 'border-slate-600'
                  } ${isUserView ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="hh:mm"
                disabled={isUserView}
              />
              {errors.tempo && (
                <p className="text-red-500 text-sm mt-1">{errors.tempo}</p>
              )}
            </div>
          )}

          {/* Tempo Executado */}
          <div>
            <label htmlFor="tmp_executado" className="block text-sm font-medium text-white mb-2">
              Tempo Executado *
            </label>
            <input
              type="text"
              id="tmp_executado"
              value={formData.tmp_executado}
              onChange={(e) => {
                const formattedTime = formatHHMM(e.target.value);
                setFormData(prev => ({ ...prev, tmp_executado: formattedTime }));
                clearError('tmp_executado');
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setFormData(prev => ({ ...prev, tmp_executado: adjustHHMM(prev.tmp_executado, 15) }));
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setFormData(prev => ({ ...prev, tmp_executado: adjustHHMM(prev.tmp_executado, -15) }));
                }
              }}
              maxLength={5}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.tmp_executado ? 'border-red-500' : 'border-slate-600'}`}
              placeholder="hh:mm"
            />
            {errors.tmp_executado && (
              <p className="text-red-500 text-sm mt-1">{errors.tmp_executado}</p>
            )}
          </div>

          {/* Checkbox isDesvio */}
          <div className="flex items-center space-x-2">
            {!isUserView && (
              <>
            <Checkbox
              id="isDesvio"
              checked={formData.isDesvio}
              onCheckedChange={(checked) => {
                setFormData(prev => ({ ...prev, isDesvio: checked as boolean, tempo: checked ? '00:00' : prev.tempo }));
                clearError('tempo');
              }}
            />
            <label
              htmlFor="isDesvio"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
            >
              Desvio de planejamento
            </label>
            </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="cancel"
              className="flex-1"
              disabled={loading || deleteLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="login"
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