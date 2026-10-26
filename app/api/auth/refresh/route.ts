import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens, setTokenCookies } from '@/lib/auth/jwt';
import connectDB from '@/lib/db/connect';
import Admin from '@/lib/db/models/Admin';
import Cafe from '@/lib/db/models/Cafe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    const requestedRole = body?.role || req.nextUrl.searchParams.get('role');

    let refreshToken: string | undefined;

    if (requestedRole === 'superadmin') {
      refreshToken = req.cookies.get('refreshToken_superadmin')?.value || body?.refreshToken;
    } else if (requestedRole === 'cafeadmin') {
      refreshToken = req.cookies.get('refreshToken_cafeadmin')?.value || body?.refreshToken;
    } else {
      // Auto-detect based on referer
      const referer = req.headers.get('referer') || '';
      const isSuperAdminReferer = referer.includes('/admin') && !referer.match(/\/[^/]+\/admin/);
      if (isSuperAdminReferer && req.cookies.get('refreshToken_superadmin')?.value) {
        refreshToken = req.cookies.get('refreshToken_superadmin')?.value;
      } else if (req.cookies.get('refreshToken_cafeadmin')?.value) {
        refreshToken = req.cookies.get('refreshToken_cafeadmin')?.value;
      } else {
        refreshToken = req.cookies.get('refreshToken_superadmin')?.value || body?.refreshToken;
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token required' },
        { status: 401 }
      );
    }

    const user = verifyRefreshToken(refreshToken);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const sessionStart = user.sessionStart
      ? user.sessionStart
      : user.iat
      ? user.iat * 1000
      : Date.now();

    const maxSessionDuration = 1000 * 60 * 60 * 24 * 7;
    if (Date.now() - sessionStart > maxSessionDuration) {
      return NextResponse.json(
        { success: false, message: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    await connectDB();
    let tokenVersion = 0;
    if (user.role === 'superadmin') {
      const admin = await Admin.findById(user.id);
      if (!admin) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }
      tokenVersion = admin.tokenVersion ?? 0;
    } else if (user.role === 'cafeadmin') {
      // Try Admin first (preferred)
      const admin = await Admin.findById(user.id);
      if (admin) {
        tokenVersion = admin.tokenVersion ?? 0;
      } else {
        const cafe = await Cafe.findOne({ username: user.username });
        if (!cafe) {
          return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        tokenVersion = cafe.tokenVersion ?? 0;
      }
    }

    // If refresh token's tokenVersion mismatches DB, reject (skipped for superadmin to prevent recurring logouts)
    if (user.role !== 'superadmin' && (user as any).tokenVersion !== undefined && (user as any).tokenVersion !== tokenVersion) {
      return NextResponse.json(
        { success: false, message: 'Session invalidated. Please login again.' },
        { status: 401 }
      );
    }

    // Generate new tokens with current DB tokenVersion
    const { token, refreshToken: newRefreshToken } = generateTokens({
      id: user.id,
      username: user.username,
      role: user.role,
      cafeSlug: user.cafeSlug,
      cafeName: (user as any).cafeName,
      tokenVersion,
      sessionStart,
    });

    // Set new cookies
    setTokenCookies(token, newRefreshToken, user.role);

    return NextResponse.json({
      success: true,
      token,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
