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

    const cafe = await Cafe.findOne({ slug: params.slug }).select('slug cafeName isActive endDate subscriptionPlan taxRate showTax');

    if (!cafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
        { status: 404 }
      );
    }

    // Check if subscription has expired
    const isExpired = cafe.subscriptionPlan !== 'Lifetime' && new Date(cafe.endDate) < new Date();

    // Return only necessary public information
    return NextResponse.json({
      success: true,
      data: {
        slug: cafe.slug,
        cafeName: cafe.cafeName,
        isActive: cafe.isActive && !isExpired,
        isManuallyDeactivated: !cafe.isActive,
        isExpired,
        taxRate: cafe.taxRate ?? 5.0,
        showTax: cafe.showTax ?? true,
      },
    });
  } catch (error) {
    console.error('Error fetching cafe:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}