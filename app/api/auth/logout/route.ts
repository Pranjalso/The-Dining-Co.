import { NextRequest, NextResponse } from 'next/server';
import { clearTokenCookies } from '@/lib/auth/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    clearTokenCookies();
    return NextResponse.json({ success: true, message: 'Logged out' });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
