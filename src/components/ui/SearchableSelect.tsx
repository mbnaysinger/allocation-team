import React from 'react';
import Select, { Props as SelectProps, StylesConfig } from 'react-select';

// Definir uma interface para as opções para garantir consistência
export interface SelectOption {
  value: string;
  label: string;
}

// Estilos customizados usando a API styles do react-select
const customStyles: StylesConfig<SelectOption, boolean> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1e293b', // slate-800
    borderColor: state.isFocused ? '#06b6d4' : '#475569', // cyan-500 : slate-600
    borderWidth: '2px',
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(6, 182, 212, 0.2)' : 'none',
    minHeight: '40px',
    '&:hover': {
      borderColor: '#64748b', // slate-500
    },
  }),
  input: (provided) => ({
    ...provided,
    color: '#ffffff',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af', // gray-400
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#ffffff',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#06b6d4', // cyan-500
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#ffffff',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#0891b2', // cyan-600
      color: '#ffffff',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#1e293b', // slate-800
    border: '2px solid #475569', // slate-600
    borderRadius: '0.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#06b6d4' // cyan-500
      : state.isFocused 
        ? '#475569' // slate-600
        : 'transparent',
    color: '#ffffff',
    cursor: 'pointer',
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: state.isSelected ? '#06b6d4' : '#475569',
    },
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: '#475569', // slate-600
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#9ca3af', // gray-400
    '&:hover': {
      color: '#22d3ee', // cyan-400
    },
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: '#9ca3af', // gray-400
    padding: '16px',
  }),
};

// Estender as props do react-select para adicionar nossas customizações, se necessário
const SearchableSelect = <IsMulti extends boolean = false>(
  props: SelectProps<SelectOption, IsMulti>
) => {
  return (
    <Select<SelectOption, IsMulti>
      {...props}
      styles={customStyles}
      noOptionsMessage={() => 'Nenhuma opção encontrada'}
      className="react-select-container"
      classNamePrefix="react-select"
    />
  );
};

export default SearchableSelect; 