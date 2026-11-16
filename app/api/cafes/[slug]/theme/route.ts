import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Cafe from '@/lib/db/models/Cafe';
import { withCafeAccess, AuthRequest } from '@/lib/auth/middleware';
import { pusher } from '@/lib/pusher';

export const dynamic = 'force-dynamic';

const ALLOWED_THEMES = ['warm-beige', 'red-black', 'light-green-creme'];

// GET /api/cafes/[slug]/theme - Fetch the active theme for customer or admin
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const cafe = await Cafe.findOne({ slug: params.slug }).select('theme slug cafeName');
    if (!cafe) {
      return NextResponse.json({ success: false, message: 'Cafe not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        theme: cafe.theme || 'warm-beige',
        slug: cafe.slug,
        cafeName: cafe.cafeName,
      },
    });
  } catch (error: any) {
    console.error('Error fetching cafe theme:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/cafes/[slug]/theme - Cafe manager updates theme
export const PUT = withCafeAccess(async (
  req: AuthRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();
    const { theme } = await req.json();

    if (!theme || !ALLOWED_THEMES.includes(theme)) {
      return NextResponse.json(
        { success: false, message: `Invalid theme. Allowed values: ${ALLOWED_THEMES.join(', ')}` },
        { status: 400 }
      );
    }

    const cafe = await Cafe.findOneAndUpdate(
      { slug: params.slug },
      { theme },
      { returnDocument: 'after' }
    ).select('theme slug cafeName');

    if (!cafe) {
      return NextResponse.json({ success: false, message: 'Cafe not found' }, { status: 404 });
    }

    // Broadcast theme update in real-time to both customer menu and cafe owner tabs
    try {
      await pusher.trigger(`cafe-${params.slug.toLowerCase()}`, 'theme-updated', {
        theme: cafe.theme,
        slug: cafe.slug,
        timestamp: new Date().toISOString(),
      });
    } catch (pusherErr) {
      console.warn('[Pusher] Theme update trigger error:', pusherErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Theme updated successfully',
      data: {
        theme: cafe.theme,
        slug: cafe.slug,
      },
    });
  } catch (error: any) {
    console.error('Error updating cafe theme:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});

