
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

  // Choose which token to prefer based on the route being accessed so roles don't collide
  let token = null;
  if (isSuperAdminRoute) {
    token = req.cookies.get('token_superadmin')?.value || req.cookies.get('token_cafeadmin')?.value || null;
  } else if (isCafeAdminRoute) {
    token = req.cookies.get('token_cafeadmin')?.value || req.cookies.get('token_superadmin')?.value || null;
  } else {
    token = req.cookies.get('token_cafeadmin')?.value || req.cookies.get('token_superadmin')?.value || null;
  }

  // --- Logic for Admin Routes ---
  if (isSuperAdminRoute || isCafeAdminRoute) {
    // If no token, redirect to appropriate login page
    if (!token) {
      // Industry standard: Use absolute URLs for redirects
      const loginUrl = new URL(isCafeAdminRoute && cafeSlugInPath ? `/${cafeSlugInPath}/adminlogin` : '/adminlogin', req.url);
      loginUrl.search = ''; 
      return NextResponse.redirect(loginUrl);
    }

    let user = decodeJwtPayload(token);
    
    // Check if token is expired or invalid
    if (!user || (user.exp && user.exp * 1000 < Date.now())) {
      const loginUrl = new URL(isCafeAdminRoute && cafeSlugInPath ? `/${cafeSlugInPath}/adminlogin` : '/adminlogin', req.url);
      const response = NextResponse.redirect(loginUrl);
      // Clear any auth cookies (both roles) when token expired/invalid
      response.cookies.delete('token_superadmin');
      response.cookies.delete('refreshToken_superadmin');
      response.cookies.delete('token_cafeadmin');
      response.cookies.delete('refreshToken_cafeadmin');
      return response;
    }

    // A. Super Admin Route Protection
    if (isSuperAdminRoute && user.role !== 'superadmin') {
      // If someone tries to access superadmin area without superadmin role, send them to superadmin login
      const url = new URL('/adminlogin', req.url);
      url.search = '';
      return NextResponse.redirect(url);
    }

    // B. Cafe Admin Route Protection
    if (isCafeAdminRoute) {
      // Super admins can access any cafe admin page
      if (user.role === 'superadmin') {
        return NextResponse.next();
      }

      // STRICT ISOLATION: Cafe admins must have the correct role AND match the slug in the URL
      // We use case-insensitive comparison for robustness
      const userSlug = user.cafeSlug?.toLowerCase();
      const pathSlug = cafeSlugInPath?.toLowerCase();

      if (user.role !== 'cafeadmin' || !userSlug || userSlug !== pathSlug) {
        // If they are not the correct cafe admin, send them to their specific login
        const url = new URL(`/${cafeSlugInPath}/adminlogin`, req.url);
        url.search = '';
        return NextResponse.redirect(url);
      }
    }
    
    return NextResponse.next();
  }

  // --- Logic for Login Pages ---
  if (pathname === '/adminlogin' || isCafeAdminLoginRoute) {
    if (token) {
      const user = decodeJwtPayload(token);
      if (user && user.exp && user.exp * 1000 > Date.now()) {
        if (user.role === 'superadmin' && pathname === '/adminlogin') {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
        const currentLoginSlug = isCafeAdminLoginRoute ? pathParts[0] : null;
        if (user.role === 'cafeadmin' && currentLoginSlug && user.cafeSlug === currentLoginSlug) {
          return NextResponse.redirect(new URL(`/${user.cafeSlug}/admin`, req.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
