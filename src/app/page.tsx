'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Ainda verificando a sessão

    if (status === 'unauthenticated') {
      router.push('/login'); // Redireciona para a página de login se não autenticado
    } else if (status === 'authenticated') {
      router.push('/allocation'); // Redireciona para /allocation se autenticado
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return null; // Não renderiza nada enquanto o redirecionamento ocorre
}