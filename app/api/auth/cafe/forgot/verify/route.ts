import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import PasswordReset from '@/lib/db/models/PasswordReset';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  slug: z.string().min(1),
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const { slug, email, otp } = schema.parse(body);
    const emailLc = email.toLowerCase();

    const pr = await PasswordReset.findOne({ cafeSlug: slug, email: emailLc, used: false }).sort({ createdAt: -1 });
    if (!pr || pr.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }
    const valid = await pr.compareOtp(otp);
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'OTP verified' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Internal server error' }, { status: 500 });
  }
};
