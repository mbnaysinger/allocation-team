import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Layers, X } from "lucide-react";
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
import { Epico, STATUS_EPICO } from "@/backend/core/models/projeto/Epico";
import SearchableSelect, { SelectOption } from "@/components/ui/SearchableSelect";

const epicSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório").max(100, "Máximo 100 caracteres"),
  descricao: z.string().max(500, "Máximo 500 caracteres").optional(),
  status: z.enum(STATUS_EPICO as [string, ...string[]]),
  dataInicio: z.date(),
  dataFimPrevisto: z.date(),
  projetoId: z.string(),
});

type EpicFormData = z.infer<typeof epicSchema>;

interface EpicCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EpicFormData) => void;
  projetoTitulo?: string;
  projetoId: string;
}

export function EpicCreateModal({
  isOpen,
  onClose,
  onSubmit,
  projetoTitulo,
  projetoId,
}: EpicCreateModalProps) {
  const form = useForm<EpicFormData>({
    resolver: zodResolver(epicSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      status: "planejado",
      dataInicio: new Date(),
      dataFimPrevisto: new Date(),
      projetoId: projetoId,
    },
  });

  const dataInicio = useWatch({
    control: form.control,
    name: "dataInicio",
  });

  const handleSubmit = (data: EpicFormData) => {
    onSubmit({ ...data, projetoId: projetoId });
    onClose();
    form.reset();
  };

  if (!isOpen) return null;

  const statusOptions: SelectOption[] = STATUS_EPICO.map(s => ({ value: s, label: s === 'planejado' ? 'Planejado' : s === 'em_andamento' ? 'Em Andamento' : s === 'concluido' ? 'Concluído' : 'Cancelado' }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-teal-400" />
            Novo Épico
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {projetoTitulo && (
          <p className="text-sm text-slate-400 mb-4">
            Projeto: {projetoTitulo}
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
                    <Input placeholder="Nome do épico" {...field} className="bg-slate-700 border-slate-600 text-white" />
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
                      placeholder="Descreva o objetivo e entregáveis do épico"
                      rows={3}
                      {...field} 
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </FormControl>
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
                          minDate={dataInicio}
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
              <Button type="submit" className="min-w-[100px] bg-teal-500 hover:bg-teal-600 text-white">
                Criar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
