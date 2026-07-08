import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Admin from '@/lib/db/models/Admin';
import { generateTokens, setTokenCookies } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    console.log('[ADMIN LOGIN] request body:', JSON.stringify(body));
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    // Env-based superadmin login (no DB required)
    const envUser = process.env.SUPERADMIN_USERNAME;
    const envPass = process.env.SUPERADMIN_PASSWORD;

    if (envUser && envPass && username === envUser && password === envPass) {
      let admin = await Admin.findOne({ username: envUser, role: 'superadmin' });
      if (!admin) {
        admin = await Admin.create({
          username: envUser,
          password: envPass,
          role: 'superadmin',
        });
      } else {
        const matches = await admin.comparePassword(envPass);
        if (!matches) {
          admin.password = envPass;
          await admin.save();
        }
      }

      const { token, refreshToken } = generateTokens({
        id: admin._id.toString(),
        username: admin.username,
        role: 'superadmin',
        tokenVersion: admin.tokenVersion ?? 0,
        sessionStart: Date.now(),
      });

      console.log('[ADMIN LOGIN] generated tokens for superadmin, setting cookies');
      setTokenCookies(token, refreshToken, 'superadmin');

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
        },
        // Debug: reveal which cookie names were set (dev only)
        cookieNames: process.env.NODE_ENV === 'production' ? undefined : { token: 'token_superadmin', refreshToken: 'refreshToken_superadmin' },
      });
    }

    // Find admin user
    const admin = await Admin.findOne({ 
      username, 
      role: 'superadmin' 
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await admin.comparePassword(password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens({
      id: admin._id.toString(),
      username: admin.username,
      role: 'superadmin',
      tokenVersion: admin.tokenVersion ?? 0,
      sessionStart: Date.now(),
    });

    // Set cookies
    console.log('[ADMIN LOGIN] generated tokens for superadmin, setting cookies');
    setTokenCookies(token, refreshToken, 'superadmin');

    // Debug: reveal which cookie names were set (dev only)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
      cookieNames: process.env.NODE_ENV === 'production' ? undefined : { token: 'token_superadmin', refreshToken: 'refreshToken_superadmin' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
