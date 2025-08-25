'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';
import { useId } from 'react';

interface TooltipWrapperProps {
  content: string;
  children: React.ReactNode;
  place?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  [key: string]: unknown; // Para outras props HTML
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ 
  content, 
  children, 
  place = 'bottom',
  className = '',
  ...props 
}) => {
  const tooltipId = useId();
  
  return (
    <>
      <div 
        data-tooltip-content={content} 
        data-tooltip-id={tooltipId}
        data-tooltip-place={place}
        data-tooltip-class-name='font-bold text-xs md:text-sm'
        className={className}
        {...props}
      >
        {children}
      </div>
      <Tooltip id={tooltipId} />
    </>
  );
};