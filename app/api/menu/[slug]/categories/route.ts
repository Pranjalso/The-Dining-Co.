import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import MenuItem from '@/lib/db/models/MenuItem';
import { withCafeAccess, AuthRequest } from '@/lib/auth/middleware';
import { getMenuCategories } from '@/lib/db/menu';

// Aggregate distinct categories for a cafe (Public)
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    const data = await getMenuCategories(slug);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
