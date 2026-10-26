import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Offer from '@/lib/db/models/Offer';
import Cafe from '@/lib/db/models/Cafe';

// GET: Fetch offers for a cafe (both public active-only and admin all-offers)
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Cafe slug is required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim();

    // Verify cafe exists
    const cafe = await Cafe.findOne({ slug: cleanSlug });
    if (!cafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
        { status: 404 }
      );
    }

    const { searchParams } = req.nextUrl;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const query: any = { cafeSlug: cleanSlug };
    if (activeOnly) {
      query.isActive = true;
    }

    const offers = await Offer.find(query)
      .sort({ orderIndex: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: offers.length,
      cafeName: cafe.cafeName,
      data: offers,
    });
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

// POST: Create a new offer for a cafe
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Cafe slug is required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim();

    // Verify cafe exists
    const cafe = await Cafe.findOne({ slug: cleanSlug });
    if (!cafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      discountType,
      discountValue,
      code,
      minOrderAmount,
      badgeText,
      isActive,
      validTill,
    } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Offer title is required' },
        { status: 400 }
      );
    }

    if (!discountValue || typeof discountValue !== 'string' || !discountValue.trim()) {
      return NextResponse.json(
        { success: false, message: 'Discount value is required (e.g., 20%, ₹100, ₹299)' },
        { status: 400 }
      );
    }

    const validTypes = ['percentage', 'flat', 'combo', 'bogo', 'custom'];
    const resolvedType = validTypes.includes(discountType) ? discountType : 'percentage';

    const newOffer = await Offer.create({
      cafeSlug: cleanSlug,
      title: title.trim().slice(0, 100),
      description: description ? String(description).trim().slice(0, 500) : '',
      discountType: resolvedType,
      discountValue: discountValue.trim().slice(0, 50),
      code: code ? String(code).trim().toUpperCase().slice(0, 25) : '',
      minOrderAmount: Number(minOrderAmount) > 0 ? Number(minOrderAmount) : 0,
      badgeText: badgeText ? String(badgeText).trim().toUpperCase().slice(0, 40) : 'SPECIAL OFFER',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      validTill: validTill ? new Date(validTill) : undefined,
    });

    console.log(`✅ Created offer [${newOffer._id}] for cafe [${cleanSlug}]: ${newOffer.title}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Offer created successfully',
        data: newOffer,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create offer' },
      { status: 500 }
    );
  }
}
