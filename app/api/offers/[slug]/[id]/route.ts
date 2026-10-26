import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Offer from '@/lib/db/models/Offer';

// PATCH: Update an existing offer (including quick isActive toggle)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    await connectDB();
    const { slug, id } = params;

    if (!slug || !id) {
      return NextResponse.json(
        { success: false, message: 'Cafe slug and Offer ID are required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim();

    const offer = await Offer.findOne({ _id: id, cafeSlug: cleanSlug });
    if (!offer) {
      return NextResponse.json(
        { success: false, message: 'Offer not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Partial updates
    if (body.title !== undefined) offer.title = String(body.title).trim().slice(0, 100);
    if (body.description !== undefined) offer.description = String(body.description).trim().slice(0, 500);
    if (body.discountType !== undefined) offer.discountType = body.discountType;
    if (body.discountValue !== undefined) offer.discountValue = String(body.discountValue).trim().slice(0, 50);
    if (body.code !== undefined) offer.code = String(body.code).trim().toUpperCase().slice(0, 25);
    if (body.minOrderAmount !== undefined) offer.minOrderAmount = Number(body.minOrderAmount) || 0;
    if (body.badgeText !== undefined) offer.badgeText = String(body.badgeText).trim().toUpperCase().slice(0, 40);
    if (body.isActive !== undefined) offer.isActive = Boolean(body.isActive);
    if (body.validTill !== undefined) {
      offer.validTill = body.validTill ? new Date(body.validTill) : undefined;
    }
    if (body.orderIndex !== undefined) offer.orderIndex = Number(body.orderIndex) || 0;

    await offer.save();

    console.log(`✅ Updated offer [${id}] for [${cleanSlug}]: active=${offer.isActive}`);

    return NextResponse.json({
      success: true,
      message: 'Offer updated successfully',
      data: offer,
    });
  } catch (error: any) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update offer' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an offer
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    await connectDB();
    const { slug, id } = params;

    if (!slug || !id) {
      return NextResponse.json(
        { success: false, message: 'Cafe slug and Offer ID are required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim();

    const deleted = await Offer.findOneAndDelete({ _id: id, cafeSlug: cleanSlug });
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Offer not found or already deleted' },
        { status: 404 }
      );
    }

    console.log(`🗑️ Deleted offer [${id}] for cafe [${cleanSlug}]`);

    return NextResponse.json({
      success: true,
      message: 'Offer deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting offer:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete offer' },
      { status: 500 }
    );
  }
}
