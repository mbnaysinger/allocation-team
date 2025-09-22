export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  // A lógica de verificação de sessão foi movida para o middleware.ts
  // Este layout agora apenas serve para agrupar as rotas privadas.
  return <>{children}</>;
}
