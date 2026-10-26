import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Admin from '@/lib/db/models/Admin';
import Cafe from '@/lib/db/models/Cafe';
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
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    // Prevent superadmin login through cafe login endpoint - enforce separation
    const envUser = process.env.SUPERADMIN_USERNAME;
    const envPass = process.env.SUPERADMIN_PASSWORD;

    if (envUser && envPass && username === envUser && password === envPass) {
      return NextResponse.json(
        { success: false, message: 'This login portal is for Cafe Admins only. Super Admins must log in at /adminlogin' },
        { status: 403 }
      );
    }

    // Search for the user in both Admin and Cafe collections
    // The input 'username' could be: username, email, or cafe slug
    let admin = await Admin.findOne({
      $or: [
        { username: username },
        { cafeSlug: username }
      ]
    });

    // If not found in Admin by username/slug, check Cafe collection for email or username or slug
    let cafe: any = null;
    if (!admin) {
      cafe = await Cafe.findOne({
        $or: [
          { username: username },
          { email: username.toLowerCase() },
          { slug: username.toLowerCase() }
        ]
      });

      if (!cafe) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // If we found a cafe, find its associated admin
      admin = await Admin.findOne({
        username: cafe.username
      });

      // If no admin record exists yet for this cafe, we'll use the cafe record for login
      if (!admin) {
        // Check if password matches (hashed in Cafe model)
        const cafeValid = await import('bcryptjs').then(m => m.default.compare(password, cafe.password));
        if (!cafeValid) {
          return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
          );
        }

        // Generate tokens for cafe - include cafeName in the payload
        const { token, refreshToken } = generateTokens({
          id: cafe._id.toString(),
          username: cafe.username,
          role: 'cafeadmin',
          cafeSlug: cafe.slug,
          cafeName: cafe.cafeName, // Add cafeName here
          tokenVersion: cafe.tokenVersion ?? 0,
          sessionStart: Date.now(),
        });

        setTokenCookies(token, refreshToken, 'cafeadmin');

        return NextResponse.json({
          success: true,
          message: 'Login successful',
          token,
          refreshToken,
          user: {
            id: cafe._id,
            username: cafe.username,
            role: 'cafeadmin',
            cafeSlug: cafe.slug,
            cafeName: cafe.cafeName,
          },
        });
      }
    }

    // If we have an admin record (either found directly or via cafe)
    // Verify password for Admin user
    let isValid = await admin.comparePassword(password);

    // Fallback migration path: if Admin compare fails, try Cafe password (handles historical double-hash issue)
    if (!isValid) {
      const cafeForMigration = await Cafe.findOne({
        $or: [
          { username: admin.username },
          { slug: admin.cafeSlug }
        ]
      });

      if (cafeForMigration) {
        const cafeValid = await import('bcryptjs').then(m => m.default.compare(password, cafeForMigration.password));
        if (cafeValid) {
          // Migrate admin password to correct hash based on provided password
          admin.password = password; // pre-save hook will hash
          await admin.save();
          isValid = true;
        }
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get cafe details if not already fetched
    if (!cafe) {
      cafe = await Cafe.findOne({ slug: admin.cafeSlug });
    }

    if (!cafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
        { status: 404 }
      );
    }

    // Generate tokens - include cafeName in the payload
    const { token, refreshToken } = generateTokens({
      id: admin._id.toString(),
      username: admin.username,
      role: admin.role,
      cafeSlug: cafe.slug,
      cafeName: cafe.cafeName, // Add cafeName here
      tokenVersion: admin.tokenVersion ?? 0,
      sessionStart: Date.now(),
    });

    setTokenCookies(token, refreshToken, 'cafeadmin');

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        cafeSlug: cafe.slug,
        cafeName: cafe.cafeName,
      },
    });
  } catch (error) {
    console.error('Cafe login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}