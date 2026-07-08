import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens, setTokenCookies } from '@/lib/auth/jwt';
import connectDB from '@/lib/db/connect';
import Admin from '@/lib/db/models/Admin';
import Cafe from '@/lib/db/models/Cafe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken_cafeadmin')?.value || req.cookies.get('refreshToken_superadmin')?.value ||
                        (await req.json()).refreshToken;

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
