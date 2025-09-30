import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, CheckSquare, Users, X } from "lucide-react";
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
import { Tarefa, STATUS_TAREFA } from "@/backend/core/models/projeto/Tarefa";
import SearchableSelect, { SelectOption } from "@/components/ui/SearchableSelect";

const taskSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório").max(100, "Máximo 100 caracteres"),
  descricao: z.string().max(500, "Máximo 500 caracteres").optional(),
  status: z.enum(STATUS_TAREFA),
  executorId: z.array(z.string()).min(1, "Pelo menos um executor é obrigatório"),
  dataInicio: z.date(),
  dataFimPrevisto: z.date(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData, epicId: string) => void;
  epicTitle?: string;
  epicId: string;
}

export function TaskCreateModal({
  isOpen,
  onClose,
  onSubmit,
  epicTitle,
  epicId,
}: TaskCreateModalProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      status: "nao_iniciada",
      executorId: [],
      dataInicio: new Date(),
      dataFimPrevisto: new Date(),
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    onSubmit(data, epicId);
    onClose();
    form.reset();
  };

  if (!isOpen) return null;

  const statusOptions: SelectOption[] = STATUS_TAREFA.map(s => ({ value: s, label: s === 'nao_iniciada' ? 'Não Iniciada' : s === 'em_andamento' ? 'Em Andamento' : s === 'concluida' ? 'Concluída' : 'Cancelada' }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-slate-400" />
            Nova Tarefa
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {epicTitle && (
          <p className="text-sm text-slate-400 mb-4">
            Épico: {epicTitle}
          </p>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da tarefa" {...field} className="bg-slate-700 border-slate-600 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o que deve ser feito nesta tarefa"
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

              <FormField
                control={form.control}
                name="executorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Executores *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          className="pl-10 bg-slate-700 border-slate-600 text-white"
                          placeholder="IDs dos executores (separados por vírgula)" 
                          value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                          onChange={(e) => {
                            const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                            field.onChange(values);
                          }}
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
                              "w-full pl-3 text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
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
                            form.getValues().dataInicio ? date < form.getValues().dataInicio! : false
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 hover:bg-slate-700">
                Cancelar
              </Button>
              <Button type="submit" className="min-w-[100px] bg-slate-500 hover:bg-slate-600 text-white">
                Criar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
