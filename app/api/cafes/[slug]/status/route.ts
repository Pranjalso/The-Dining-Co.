import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Cafe from '@/lib/db/models/Cafe';
import { withAuth } from '@/lib/auth/middleware';
import { AuthRequest } from '@/lib/auth/middleware';

export const PATCH = withAuth(async (req: AuthRequest, { params }: { params: { slug: string } }) => {
  try {
    await connectDB();

    const { isActive } = await req.json();

    const cafe = await Cafe.findOneAndUpdate(
      { slug: params.slug },
      { isActive },
      { new: true }
    );

    if (!cafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cafe ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: cafe,
    });
  } catch (error) {
    console.error('Error updating cafe status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requireAdmin: true });