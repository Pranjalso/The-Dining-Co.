import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import connectDB from '@/lib/db/connect';
import Cafe from '@/lib/db/models/Cafe';
import Admin from '@/lib/db/models/Admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const roleParam = req.nextUrl.searchParams.get('role');
    const referer = req.headers.get('referer') || '';
    const isSuperAdmin = roleParam === 'superadmin' || (referer.includes('/admin') && !referer.match(/\/[^/]+\/admin/));
    const isCafeAdmin = roleParam === 'cafeadmin' || (!isSuperAdmin && referer.includes('/admin'));

    let token: string | undefined;
    if (isSuperAdmin) {
      token = req.cookies.get('token_superadmin')?.value;
    } else if (isCafeAdmin) {
      token = req.cookies.get('token_cafeadmin')?.value;
    } else {
      token = req.cookies.get('token_cafeadmin')?.value || req.cookies.get('token_superadmin')?.value;
    }

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    let userDetails = { ...payload };

    // Fetch additional cafe details if it's a cafeadmin
    if (payload.role === 'cafeadmin' && payload.cafeSlug) {
      const cafe = await Cafe.findOne({ slug: payload.cafeSlug });
      if (cafe) {
        userDetails.cafeName = cafe.cafeName;
      }
    } else if (payload.role === 'superadmin') {
      const admin = await Admin.findById(payload.id);
      if (admin) {
        userDetails.username = admin.username;
      }
    }

    return NextResponse.json({ success: true, user: userDetails });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
