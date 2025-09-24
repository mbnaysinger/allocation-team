import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from './backend/core/models/UserRole';

// Mapeamento de rotas e os papéis necessários para acessá-las
const routePermissions: Record<string, UserRole[]> = {
  '/projetos': [UserRole.ADMIN, UserRole.USER],
  '/api/v1/projetos': [UserRole.ADMIN, UserRole.USER],
  // A rota de alocação pode ser acessada por ADMIN e USER
  '/allocation': [UserRole.ADMIN, UserRole.USER],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obter o token da requisição
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Rotas públicas que não exigem autenticação
  const publicRoutes = ['/login', '/api/auth', '/api/register'];
  if (publicRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Se não há token e a rota não é pública, redireciona/bloqueia
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ message: 'Não autorizado' }), { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificação de papéis para rotas protegidas
  const userRole = token.role as UserRole;

  // Encontra a regra de permissão para a rota atual
  const requiredRoles = Object.keys(routePermissions).find(route => pathname.startsWith(route));

  if (requiredRoles) {
    const roles = routePermissions[requiredRoles];
    if (!roles.includes(userRole)) {
      // Se for API, retorna 403 Forbidden
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ message: 'Acesso negado' }), { status: 403 });
      }
      // Para páginas, redireciona para uma página padrão (ex: allocation)
      return NextResponse.redirect(new URL('/allocation', request.url));
    }
  }

  // Se passou por todas as verificações, permite o acesso
  return NextResponse.next();
}

export const config = {
  // Executa o middleware em todas as rotas, exceto arquivos estáticos e de imagem
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
