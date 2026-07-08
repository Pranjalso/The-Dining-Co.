import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Cafe from '@/lib/db/models/Cafe';
import Admin from '@/lib/db/models/Admin';
import PasswordReset from '@/lib/db/models/PasswordReset';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendPasswordResetConfirmationEmail } from '@/lib/email/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  slug: z.string().min(1),
  email: z.string().email(),
  otp: z.string().min(6).max(6),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, 'Password must include an uppercase letter, a number, and a special character'),
});

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0];
      return NextResponse.json(
        {
          success: false,
          message: issue?.message || 'Invalid input',
          field: issue?.path?.[0] || null,
        },
        { status: 400 }
      );
    }
    const { slug, email, otp, newPassword } = parsed.data;
    const emailLc = email.toLowerCase();

    const pr = await PasswordReset.findOne({ cafeSlug: slug, email: emailLc, used: false }).sort({ createdAt: -1 });
    if (!pr || pr.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }
    const valid = await pr.compareOtp(otp);
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    const cafe = await Cafe.findOne({ slug, email: emailLc });
    if (!cafe) {
      return NextResponse.json({ success: false, message: 'Cafe not found' }, { status: 404 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    cafe.password = hashed;
    cafe.passwordChangedAt = new Date();
    cafe.tokenVersion = (cafe.tokenVersion ?? 0) + 1;
    await cafe.save();

    const admin = await Admin.findOne({ cafeSlug: slug });
    if (admin) {
      admin.password = newPassword;
      admin.passwordChangedAt = new Date();
      admin.tokenVersion = (admin.tokenVersion ?? 0) + 1;
      await admin.save();
    }

    pr.used = true;
    await pr.save();

    try {
      await sendPasswordResetConfirmationEmail({
        to: emailLc,
        cafeName: cafe.cafeName,
        username: cafe.username,
      });
    } catch (mailErr) {
      // non-blocking
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Internal server error' }, { status: 500 });
  }
};
