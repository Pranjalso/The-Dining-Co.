import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Cafe from '@/lib/db/models/Cafe';
import PasswordReset from '@/lib/db/models/PasswordReset';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendPasswordOtpEmail } from '@/lib/email/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  slug: z.string().min(1),
  email: z.string().email(),
});

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const { slug, email } = schema.parse(body);
    const emailLc = email.toLowerCase();

    const cafe = await Cafe.findOne({ slug, email: emailLc });
    if (!cafe) {
      return NextResponse.json({ success: true, sent: false, message: 'If the email exists, an OTP has been sent.' });
    }

    // Rate limit: prevent sending OTP more than once every 60 seconds per cafe/email
    const last = await PasswordReset.findOne({ cafeSlug: slug, email: emailLc }).sort({ createdAt: -1 });
    if (last && Date.now() - new Date(last.createdAt).getTime() < 60_000) {
      const retryAfter = 60 - Math.floor((Date.now() - new Date(last.createdAt).getTime()) / 1000);
      return NextResponse.json({ success: false, sent: false, message: `Please wait ${retryAfter}s before requesting a new code.` }, { status: 429 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordReset.create({
      cafeSlug: slug,
      email: emailLc,
      otpHash,
      expiresAt,
      used: false,
    });

    await sendPasswordOtpEmail({ to: emailLc, cafeName: cafe.cafeName, otp: code });

    return NextResponse.json({ success: true, sent: true, message: 'OTP sent' });
  } catch (e: any) {
    console.error('Forgot request error:', e);
    return NextResponse.json({ success: false, sent: false, message: e.message || 'Internal server error' }, { status: 500 });
  }
};
