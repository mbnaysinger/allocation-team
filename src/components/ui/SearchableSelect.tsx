import React from 'react';
import Select, { Props as SelectProps } from 'react-select';

// Definir uma interface para as opções para garantir consistência
export interface SelectOption {
  value: string;
  label: string;
}

// Estender as props do react-select para adicionar nossas customizações, se necessário
const SearchableSelect: React.FC<SelectProps<SelectOption, false>> = (props) => {
  return (
    <Select<SelectOption, false>
      {...props}
      placeholder="Pesquisar ou selecionar..."
      noOptionsMessage={() => 'Nenhuma opção encontrada'}
      classNames={{
        control: (state) => `
          w-full px-2 py-1 bg-bg/50 border rounded-lg text-text-light  
          focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 
          transition-all
          ${state.isFocused ? 'ring-2 ring-accent/50 border-accent/50' : 'border-accent/20'}
        `,
        input: () => 'text-text-light',
        menu: () => 'bg-gray-800 rounded-lg mt-1 border border-accent/20 shadow-lg',
        option: (state) => `
          px-4 py-2 cursor-pointer 
          ${state.isSelected ? 'bg-accent text-bg' : ''}
          ${state.isFocused ? 'bg-accent/20' : ''}
        `,
        singleValue: () => 'text-text-light',
        placeholder: () => 'text-accent/40',
        noOptionsMessage: () => 'text-accent/60 p-4',
        indicatorSeparator: () => 'bg-accent/20',
        dropdownIndicator: () => 'text-accent/60 hover:text-accent',
      }}
    />
  );
};

export default SearchableSelect; 