import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Cafe from '@/lib/db/models/Cafe';

// Public endpoint to check if cafe exists and is active (no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const cafe = await Cafe.findOne({ slug: params.slug }).select('slug cafeName isActive endDate subscriptionPlan taxRate showTax upiQrCode upiId tables theme');

    if (!cafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
        { status: 404 }
      );
    }

    // Check if subscription has expired
    const isExpired = cafe.subscriptionPlan !== 'Lifetime' && new Date(cafe.endDate) < new Date();

    // Calculate days remaining & expiry warning (before 3 days of expiration)
    let daysRemaining: number | null = null;
    let isExpiringSoon = false;
    if (cafe.subscriptionPlan !== 'Lifetime' && cafe.endDate) {
      const now = new Date();
      const end = new Date(cafe.endDate);
      const diffMs = end.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      if (daysRemaining <= 3 && !isExpired) {
        isExpiringSoon = true;
      }
    }

    // Return only necessary public information
    return NextResponse.json({
      success: true,
      data: {
        slug: cafe.slug,
        cafeName: cafe.cafeName,
        isActive: cafe.isActive && !isExpired,
        isManuallyDeactivated: !cafe.isActive,
        isExpired,
        endDate: cafe.endDate,
        subscriptionPlan: cafe.subscriptionPlan,
        daysRemaining,
        isExpiringSoon,
        taxRate: cafe.taxRate ?? 5.0,
        showTax: cafe.showTax ?? true,
        upiQrCode: cafe.upiQrCode || null,
        upiId: cafe.upiId || null,
        tables: cafe.tables || [],
        theme: cafe.theme || 'warm-beige',
      },
    });
  } catch (error: any) {
    console.error('Error fetching cafe:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}