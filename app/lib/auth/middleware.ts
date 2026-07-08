import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import connectDB from '@/lib/db/connect';
import Admin from '@/lib/db/models/Admin';
import Cafe from '@/lib/db/models/Cafe';

export interface AuthRequest extends NextRequest {
  user?: {
    id: string;
    username: string;
    role: string;
    cafeSlug?: string;
  };
}

export const withAuth = (
  handler: (req: AuthRequest, ...args: any[]) => Promise<NextResponse>,
  options?: { requireAdmin?: boolean; requireCafe?: boolean }
) => {
  return async (req: AuthRequest, ...args: any[]) => {
    const authHeaderToken = req.headers.get('authorization')?.replace('Bearer ', '');
    const superadminToken = req.cookies.get('token_superadmin')?.value;
    const cafeadminToken = req.cookies.get('token_cafeadmin')?.value;

    let token: string | undefined;
    if (options?.requireAdmin) {
      token = superadminToken || authHeaderToken || cafeadminToken;
    } else if (options?.requireCafe) {
      token = cafeadminToken || authHeaderToken || superadminToken;
    } else {
      token = cafeadminToken || superadminToken || authHeaderToken;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify tokenVersion against DB to invalidate sessions after password reset
    try {
      await connectDB();
      if (user.role === 'superadmin') {
        // For superadmin, we prioritize staying logged in as requested
        // We only check if the admin exists, skipping tokenVersion check to prevent recurring logouts
        const admin = await Admin.findById(user.id);
        if (!admin) {
          return NextResponse.json({ success: false, message: 'Admin account not found' }, { status: 404 });
        }
      } else if (user.role === 'cafeadmin') {
        // Prefer Admin record if exists; otherwise fall back to Cafe
        const admin = await Admin.findById(user.id);
        if (admin) {
          // Skipping tokenVersion check to prevent recurring logouts as requested
        } else {
          const cafe = await Cafe.findOne({ username: user.username });
          if (!cafe) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
          }
          if (!cafe.isActive) {
            return NextResponse.json({ success: false, message: 'Cafe is deactivated' }, { status: 403 });
          }
          // Skipping tokenVersion check to prevent recurring logouts as requested
        }
      }
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Authentication check failed' }, { status: 500 });
    }

    // Check role requirements
    if (options?.requireAdmin && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    if (options?.requireCafe && user.role !== 'cafeadmin') {
      return NextResponse.json(
        { success: false, message: 'Cafe admin access required' },
        { status: 403 }
      );
    }

    // Attach user to request
    req.user = user;

    return handler(req, ...args);
  };
};

// Middleware to check if user has access to specific cafe
export const withCafeAccess = (
  handler: (req: AuthRequest, ...args: any[]) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthRequest, ...args: any[]) => {
    const { pathname } = req.nextUrl;
    
    // Find slug from path. Supports both /api/menu/[slug] and /api/orders/[slug]
    const pathParts = pathname.split('/');
    let slug = '';
    
    const menuIndex = pathParts.indexOf('menu');
    const ordersIndex = pathParts.indexOf('orders');
    const cafesIndex = pathParts.indexOf('cafes');
    
    if (menuIndex !== -1) slug = pathParts[menuIndex + 1];
    else if (ordersIndex !== -1) slug = pathParts[ordersIndex + 1];
    else if (cafesIndex !== -1) slug = pathParts[cafesIndex + 1];

    if (req.user?.role === 'cafeadmin' && req.user.cafeSlug !== slug) {
      return NextResponse.json(
        { success: false, message: 'Access denied to this cafe' },
        { status: 403 }
      );
    }

    return handler(req, ...args);
  }, { requireCafe: true });
};
