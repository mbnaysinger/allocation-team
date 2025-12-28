'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { SelectOption } from './SearchableSelect';
import { trimText } from '@/lib/utils';

interface TruncatedMultiSelectProps {
  options: SelectOption[];
  value: SelectOption[];
  onChange: (selectedOptions: SelectOption[]) => void;
  placeholder: string;
  instanceId?: string;
  maxDisplayItems?: number;
  isDisabled?: boolean;
}

const TruncatedMultiSelect: React.FC<TruncatedMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  maxDisplayItems = 1,
  isDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opções baseado no termo de busca
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle do dropdown
  const toggleDropdown = () => {
    if (isDisabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Selecionar/deselecionar opção
  const toggleOption = (option: SelectOption) => {
    const isSelected = value.some(item => item.value === option.value);

    if (isSelected) {
      onChange(value.filter(item => item.value !== option.value));
    } else {
      onChange([...value, option]);
    }
  };

  // Remover item específico
  const removeItem = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(item => item.value !== optionValue));
  };

  // Limpar todos os filtros
  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerClasses = `
    min-h-[40px] bg-slate-800 border-2 border-slate-600 rounded-lg px-3 py-2 
    transition-colors focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20
    ${isDisabled ? 'cursor-not-allowed bg-slate-700/50 opacity-50' : 'cursor-pointer hover:border-slate-500'}
  `;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Campo de entrada */}
      <div
        className={containerClasses}
        onClick={toggleDropdown}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {value.length === 0 ? (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {value.slice(0, maxDisplayItems).map((item) => (
                  <span
                    key={item.value}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500 text-white text-xs rounded-md"
                  >
                    {trimText(item.label, { length: 12, ellipsis: '...' })}
                    <button
                      onClick={(e) => removeItem(item.value, e)}
                      className="hover:bg-cyan-600 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {value.length > maxDisplayItems && (
                  <span className="inline-flex items-center px-2 py-1 bg-slate-600 text-gray-300 text-xs text-left rounded-md">
                    +{value.length - maxDisplayItems}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-2">
            {value.length > 0 && (
              <button
                onClick={clearAll}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
                title="Limpar todos"
              >
                <X size={16} className="text-gray-400 hover:text-white" />
              </button>
            )}
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border-2 border-slate-600 rounded-lg shadow-xl z-50 max-h-70 overflow-hidden">
          {/* Campo de busca */}
          <div className="p-2 border-b border-slate-600">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Lista de opções */}
          <div className="max-h-48 overflow-y-auto scrollbar-hide">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-gray-400 text-sm text-center">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.some(item => item.value === option.value);
                return (
                  <div
                    key={option.value}
                    className={`px-3 py-2 cursor-pointer text-sm transition-colors hover:bg-slate-700 ${isSelected ? 'bg-cyan-500 text-white' : 'text-gray-300'
                      }`}
                    onClick={() => toggleOption(option)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {isSelected}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TruncatedMultiSelect;
