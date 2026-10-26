import { NextRequest, NextResponse } from 'next/server';
import { clearTokenCookies, AuthRole } from '@/lib/auth/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    const role = (body?.role as AuthRole) || (req.nextUrl.searchParams.get('role') as AuthRole);

    if (role === 'superadmin' || role === 'cafeadmin') {
      clearTokenCookies(role);
    } else {
      const referer = req.headers.get('referer') || '';
      const isSuperAdminReferer = referer.includes('/admin') && !referer.match(/\/[^/]+\/admin/);
      if (isSuperAdminReferer) {
        clearTokenCookies('superadmin');
      } else {
        const isCafeAdminReferer = referer.includes('/admin');
        if (isCafeAdminReferer) {
          clearTokenCookies('cafeadmin');
        } else {
          clearTokenCookies();
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Logged out' });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
