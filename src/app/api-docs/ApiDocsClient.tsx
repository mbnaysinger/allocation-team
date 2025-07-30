'use client';

import { ApiReferenceReact } from '@scalar/api-reference-react';
import type { ComponentProps } from 'react';

interface ApiDocsClientProps {
  spec: any; 
}

export default function ApiDocsClient({ spec }: ApiDocsClientProps) {
  const configuration: ComponentProps<typeof ApiReferenceReact>['configuration'] = {
    content: spec,
    theme: 'default',
    layout: 'modern',
    showSidebar: true,
    isEditable: false,
  };

  return <ApiReferenceReact configuration={configuration} />;
}