import React from 'react';
import Select, { Props as SelectProps } from 'react-select';

// Definir uma interface para as opções para garantir consistência
export interface SelectOption {
  value: string;
  label: string;
}

// Estender as props do react-select para adicionar nossas customizações, se necessário
const SearchableSelect = <IsMulti extends boolean = false>(
  props: SelectProps<SelectOption, IsMulti>
) => {
  return (
    <Select<SelectOption, IsMulti>
      {...props}
      //placeholder="Pesquisar ou selecionar..."
      noOptionsMessage={() => 'Nenhuma opção encontrada'}
      classNames={{
        control: (state) => `
          w-full px-3 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg text-white  
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
          transition-all duration-200 hover:border-slate-500
          ${state.isFocused ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-slate-600'}
        `,
        input: () => 'text-white',
        menu: () => 'bg-slate-800 rounded-lg mt-1 border-2 border-slate-600 shadow-2xl z-50',
        option: (state) => `
          px-4 py-2 cursor-pointer text-white transition-colors
          ${state.isSelected ? 'bg-cyan-500 text-white' : ''}
          ${state.isFocused ? 'bg-slate-600 text-white' : 'hover:bg-slate-600'}
        `,
        singleValue: () => 'text-white',
        placeholder: () => 'text-gray-400',
        noOptionsMessage: () => 'text-gray-400 p-4',
        indicatorSeparator: () => 'bg-slate-600',
        dropdownIndicator: () => 'text-gray-400 hover:text-cyan-400 transition-colors',
        multiValue: () => 'bg-cyan-500 text-white rounded-md',
        multiValueLabel: () => 'text-white',
        multiValueRemove: () => 'text-white hover:bg-cyan-600',
      }}
    />
  );
};

export default SearchableSelect; 