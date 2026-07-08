import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Cafe from '@/lib/db/models/Cafe';
import Admin from '@/lib/db/models/Admin';
import { withAuth } from '@/lib/auth/middleware';
import { AuthRequest } from '@/lib/auth/middleware';
import bcrypt from 'bcryptjs';

// Get single cafe
export const GET = withAuth(async (req: AuthRequest, { params }: { params: { slug: string } }) => {
  try {
    await connectDB();

    const cafe = await Cafe.findOne({ slug: params.slug });

    if (!cafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cafe,
    });
  } catch (error) {
    console.error('Error fetching cafe:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requireAdmin: true });

// Update cafe
export const PUT = withAuth(async (req: AuthRequest, { params }: { params: { slug: string } }) => {
  try {
    await connectDB();

    const body = await req.json();
    const update: any = { ...body };
    // Normalize 'Lifetime' server-side and ensure endDate is far-future
    if (update.subscriptionPlan === 'Lifetime') {
      const far = new Date();
      far.setFullYear(far.getFullYear() + 100);
      update.endDate = new Date(update.endDate || far.toISOString());
    }

    // Get the existing cafe to check for changes
    const existingCafe = await Cafe.findOne({ slug: params.slug });
    if (!existingCafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
        { status: 404 }
      );
    }

    // Handle password update if provided
    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      update.passwordChangedAt = new Date();
      update.tokenVersion = (existingCafe.tokenVersion || 0) + 1;
    }

    const cafe = await Cafe.findOneAndUpdate(
      { slug: params.slug },
      update,
      { returnDocument: 'after', runValidators: true }
    );

    // If username, password, or slug changed, update the associated Admin record
    if (update.username || update.password || update.slug) {
      const admin = await Admin.findOne({ cafeSlug: params.slug });
      if (admin) {
        if (update.username) admin.username = update.username;
        if (body.password) admin.password = body.password;
        if (update.slug) admin.cafeSlug = update.slug;
        await admin.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cafe updated successfully',
      data: cafe,
    });
  } catch (error) {
    console.error('Error updating cafe:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requireAdmin: true });

// Delete cafe
export const DELETE = withAuth(async (req: AuthRequest, { params }: { params: { slug: string } }) => {
  try {
    await connectDB();

    const cafe = await Cafe.findOneAndDelete({ slug: params.slug });

    if (!cafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
        { status: 404 }
      );
    }

    // Also delete associated admin
    await Admin.findOneAndDelete({ cafeSlug: params.slug });

    return NextResponse.json({
      success: true,
      message: 'Cafe deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting cafe:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requireAdmin: true });
