import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Users, Target, X } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Calendar } from "@/components/ui/Calendar";
import { Projeto, ENTIDADES, FASES_PROJETO, STATUS_PROJETO } from "@/backend/core/models/projeto/Projeto";

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

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  project?: Partial<Projeto>;
  mode: 'create' | 'edit';
}

export function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  project,
  mode
}: ProjectFormModalProps) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      abreviatura: project?.abreviatura || "",
      nome: project?.nome || "",
      descricao: project?.descricao || "",
      entidade: project?.entidade,
      linkDocumentacao: project?.linkDocumentacao || "",
      responsavelId: project?.responsavelId || "",
      fase: project?.fase || "internal",
      status: project?.status || "backlog",
      dataInicio: project?.dataInicio,
      dataFimPrevisto: project?.dataFimPrevisto,
    },
  });

  const handleSubmit = (data: ProjectFormData) => {
    onSubmit(data);
    onClose();
    form.reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-sky-400" />
            {mode === 'create' ? 'Novo Projeto' : 'Editar Projeto'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="abreviatura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abreviatura *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: ECOM" {...field} className="bg-slate-700 border-slate-600 text-white" />
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
                      <Input placeholder="Nome do projeto" {...field} className="bg-slate-700 border-slate-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione a entidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 text-white border-slate-700">
                        {ENTIDADES.map((entidade) => (
                          <SelectItem key={entidade} value={entidade} className="hover:bg-slate-700">{entidade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          className="pl-10 bg-slate-700 border-slate-600 text-white"
                          placeholder="ID do responsável" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fase</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione a fase" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 text-white border-slate-700">
                        {FASES_PROJETO.map((fase) => (
                          <SelectItem key={fase} value={fase} className="hover:bg-slate-700">
                            {fase === 'upstream' ? 'Upstream' :
                             fase === 'downstream' ? 'Downstream' :
                             fase === 'internal' ? 'Interno' : 'Cancelado'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 text-white border-slate-700">
                        {STATUS_PROJETO.map((status) => (
                          <SelectItem key={status} value={status} className="hover:bg-slate-700">
                            {status === 'backlog' ? 'Backlog' :
                             status === 'em_andamento' ? 'Em Andamento' :
                             status === 'concluido' ? 'Concluído' : 'Cancelado'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="linkDocumentacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link da Documentação</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} className="bg-slate-700 border-slate-600 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              "w-full pl-3 text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                              !field.value && "text-slate-400"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
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
                          className="pointer-events-auto text-white"
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
                              "w-full pl-3 text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                              !field.value && "text-slate-400"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
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
                            form.getValues().dataInicio ? date < form.getValues().dataInicio! : false
                          }
                          initialFocus
                          className="pointer-events-auto text-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 hover:bg-slate-700">
                Cancelar
              </Button>
              <Button type="submit" className="min-w-[100px] bg-sky-500 hover:bg-sky-600 text-white">
                {mode === 'create' ? 'Criar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
