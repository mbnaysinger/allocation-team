import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Calendar } from "@/components/ui/Calendar";
import { ENTIDADES, FASES_PROJETO, STATUS_PROJETO } from "@/backend/core/models/projeto/Projeto";
import SearchableSelect, { SelectOption } from "@/components/ui/SearchableSelect";
import { Pessoa } from "@/backend/core/models/Pessoa";

const projectSchema = z.object({
  abreviatura: z.string().min(2, "Abreviatura deve ter pelo menos 2 caracteres").max(10, "Máximo 10 caracteres"),
  nome: z.string().min(3, "Nome é obrigatório").max(100, "Máximo 100 caracteres"),
  descricao: z.string().max(500, "Máximo 500 caracteres").optional(),
  entidade: z.enum(ENTIDADES).optional(),
  linkDocumentacao: z.string().url("URL inválida").optional().or(z.literal("")),
  responsavelId: z.string().min(1, "Responsável é obrigatório"),
  fase: z.enum(FASES_PROJETO),
  status: z.enum(STATUS_PROJETO),
  dataInicio: z.date(),
  dataFimPrevisto: z.date(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
}

export function ProjectCreateModal({
  isOpen,
  onClose,
  onSubmit,
}: ProjectCreateModalProps) {
  const [activePeople, setActivePeople] = React.useState<Pessoa[]>([]);

  React.useEffect(() => {
    const fetchActivePeople = async () => {
      try {
        const response = await fetch('/api/v1/pessoas');
        if (!response.ok) throw new Error('Failed to fetch people');
        const data = await response.json();
        setActivePeople(data);
      } catch (error) {
        console.error("Error fetching active people:", error);
      }
    };

    if (isOpen) {
      fetchActivePeople();
    }
  }, [isOpen]);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      abreviatura: "",
      nome: "",
      descricao: "",
      entidade: undefined,
      linkDocumentacao: "",
      responsavelId: "",
      fase: "internal",
      status: "backlog",
      dataInicio: new Date(),
      dataFimPrevisto: new Date(),
    },
  });

  // const dataInicio = useWatch({
  //   control: form.control,
  //   name: "dataInicio",
  // });

  const handleSubmit = (data: ProjectFormData) => {
    onSubmit(data);
    onClose();
    form.reset();
  };

  if (!isOpen) return null;

  const entidadeOptions: SelectOption[] = ENTIDADES.map(e => ({ value: e, label: e }));
  const faseOptions: SelectOption[] = FASES_PROJETO.map(f => ({ value: f, label: f === 'upstream' ? 'Upstream' : f === 'downstream' ? 'Downstream' : f === 'internal' ? 'Interno' : 'Cancelado' }));
  const statusOptions: SelectOption[] = STATUS_PROJETO.map(s => ({ value: s, label: s === 'backlog' ? 'Backlog' : s === 'em_andamento' ? 'Em Andamento' : s === 'concluido' ? 'Concluído' : 'Cancelado' }));

  return (
    <div className="fixed inset-0 bg-overlay/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      
      {/* CONTAINER DA MODAL: CLASSES DE TAMANHO ALTERADAS 
        w-11/12 h-5/6 max-w-4xl max-h-[95vh]
      */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-600 shadow-glass w-11/12 h-5/6 max-w-4xl max-h-[95vh] overflow-y-auto">
        
        {/* Header - OK com padding p-6, sticky para rolagem */}
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur-md z-10 flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-xl font-semibold text-white">
            Novo Projeto
          </h2>
          <Button
            onClick={onClose}
            variant="cancel"
            size="sm"
            className="p-2"
          >
            <X size={16} />
          </Button>
        </div>

        {/* CORPO DA MODAL: ADICIONANDO PADDING (p-6) AQUI */}
        <div className="p-6">
          <Form {...form}>
            {/* space-y-6 para um espaçamento vertical mais agradável */}
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6"> 
              
              {/* PRIMEIRA LINHA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Ajustado para gap-6 */}
                <FormField
                  control={form.control}
                  name="abreviatura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abreviatura *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: ECOM" {...field} className="w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do projeto" {...field} className="w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* DESCRIÇÃO */}
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o objetivo e escopo do projeto"
                        rows={3}
                        {...field} 
                        className="w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SEGUNDA LINHA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Ajustado para gap-6 */}
                <FormField
                  control={form.control}
                  name="entidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entidade</FormLabel>
                      <SearchableSelect
                        options={entidadeOptions}
                        value={entidadeOptions.find(o => o.value === field.value)}
                        onChange={(option) => field.onChange(option ? option.value : null)}
                        placeholder="Selecione a entidade"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                              <FormField
                                control={form.control}
                                name="responsavelId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Responsável *</FormLabel>
                                    <SearchableSelect
                                      options={activePeople.map(p => ({ value: p.nome, label: p.nome }))}
                                      value={activePeople.map(p => ({ value: p.nome, label: p.nome })).find(o => o.value === field.value)}
                                      onChange={(option) => field.onChange(option ? option.value : "")}
                                      placeholder="Selecione o responsável"
                                    />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />              </div>

              {/* TERCEIRA LINHA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Ajustado para gap-6 */}
                <FormField
                  control={form.control}
                  name="fase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fase</FormLabel>
                      <SearchableSelect
                        options={faseOptions}
                        value={faseOptions.find(o => o.value === field.value)}
                        onChange={(option) => field.onChange(option ? option.value : null)}
                        placeholder="Selecione a fase"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <SearchableSelect
                        options={statusOptions}
                        value={statusOptions.find(o => o.value === field.value)}
                        onChange={(option) => field.onChange(option ? option.value : null)}
                        placeholder="Selecione o status"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* LINK DOCUMENTAÇÃO */}
              <FormField
                control={form.control}
                name="linkDocumentacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link da Documentação</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} className="w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* QUARTA LINHA (DATAS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Ajustado para gap-6 */}
                <FormField
                  control={form.control}
                  name="dataInicio"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Início</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all justify-start text-left font-normal",
                                !field.value && "text-slate-400"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataFimPrevisto"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Término Prevista</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all justify-start text-left font-normal",
                                !field.value && "text-slate-400"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              form.getValues().dataInicio ? date < form.getValues().dataInicio : false
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* RODAPÉ/BOTÕES */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-6"> 
                <Button type="button" variant="cancel" onClick={onClose} className="border-slate-700 hover:bg-slate-700">
                  Cancelar
                </Button>
                <Button type="submit" variant="login" className="min-w-[100px] bg-sky-500 hover:bg-sky-600 text-white">
                  Criar
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
      </div>
    </div>
  );
}
