
import { NextRequest, NextResponse } from 'next/server';

export interface JwtPayload {
  id: string;
  username: string;
  role: 'superadmin' | 'cafeadmin';
  cafeSlug?: string;
  exp?: number;
}

// Helper function to decode JWT payload without jsonwebtoken (safe for Edge Runtime)
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const json = atob(base64);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Split path into parts and filter out empty strings
  const pathParts = pathname.split('/').filter(Boolean);

  // 1. Super Admin Routes (/admin, /admin/...)
  const isSuperAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  
  // 2. Cafe Admin Routes (/:slug/admin, /:slug/admin/...)
  // We check if the second segment is exactly 'admin'
  const isCafeAdminRoute = pathParts.length >= 2 && 
                           pathParts[1] === 'admin' && 
                           !['admin', 'api', '_next', 'favicon.ico', 'public'].includes(pathParts[0]);
  const cafeSlugInPath = isCafeAdminRoute ? pathParts[0] : null;

  // 3. Cafe Admin Login Routes (/:slug/adminlogin)
  const isCafeAdminLoginRoute = pathParts.length >= 2 && 
                                pathParts[1] === 'adminlogin' && 
                                !['admin', 'api', '_next', 'favicon.ico', 'public'].includes(pathParts[0]);

  const isSuperAdminLoginRoute = pathname === '/adminlogin';

  // --- 1. Super Admin Route Protection (/admin, /admin/...) ---
  if (isSuperAdminRoute) {
    const token = req.cookies.get('token_superadmin')?.value;

    if (!token) {
      const loginUrl = new URL('/adminlogin', req.url);
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }

    const user = decodeJwtPayload(token);

    if (!user || (user.exp && user.exp * 1000 < Date.now()) || user.role !== 'superadmin') {
      const loginUrl = new URL('/adminlogin', req.url);
      const response = NextResponse.redirect(loginUrl);
      // ONLY delete superadmin cookies - NEVER delete cafeadmin cookies
      response.cookies.delete('token_superadmin');
      response.cookies.delete('refreshToken_superadmin');
      return response;
    }

    return NextResponse.next();
  }

  // --- 2. Cafe Admin Route Protection (/:slug/admin, /:slug/admin/...) ---
  if (isCafeAdminRoute) {
    const token = req.cookies.get('token_cafeadmin')?.value;

    if (!token) {
      const loginUrl = new URL(`/${cafeSlugInPath}/adminlogin`, req.url);
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }

    const user = decodeJwtPayload(token);

    if (!user || (user.exp && user.exp * 1000 < Date.now())) {
      const loginUrl = new URL(`/${cafeSlugInPath}/adminlogin`, req.url);
      const response = NextResponse.redirect(loginUrl);
      // ONLY delete cafeadmin cookies - NEVER delete superadmin cookies
      response.cookies.delete('token_cafeadmin');
      response.cookies.delete('refreshToken_cafeadmin');
      return response;
    }

    // STRICT ISOLATION: Must have role 'cafeadmin' AND match the URL cafe slug
    const userSlug = user.cafeSlug?.toLowerCase();
    const pathSlug = cafeSlugInPath?.toLowerCase();

    if (user.role !== 'cafeadmin' || !userSlug || userSlug !== pathSlug) {
      const loginUrl = new URL(`/${cafeSlugInPath}/adminlogin`, req.url);
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // --- 3. Super Admin Login Page (/adminlogin) ---
  if (isSuperAdminLoginRoute) {
    const token = req.cookies.get('token_superadmin')?.value;
    if (token) {
      const user = decodeJwtPayload(token);
      if (user && user.role === 'superadmin' && user.exp && user.exp * 1000 > Date.now()) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
    return NextResponse.next();
  }

  // --- 4. Cafe Admin Login Page (/:slug/adminlogin) ---
  if (isCafeAdminLoginRoute) {
    const token = req.cookies.get('token_cafeadmin')?.value;
    const currentLoginSlug = pathParts[0]?.toLowerCase();
    if (token && currentLoginSlug) {
      const user = decodeJwtPayload(token);
      if (
        user && 
        user.role === 'cafeadmin' && 
        user.cafeSlug?.toLowerCase() === currentLoginSlug &&
        user.exp && 
        user.exp * 1000 > Date.now()
      ) {
        return NextResponse.redirect(new URL(`/${user.cafeSlug}/admin`, req.url));
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
