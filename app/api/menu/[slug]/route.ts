import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import MenuItem from '@/lib/db/models/MenuItem';
import { withCafeAccess, AuthRequest } from '@/lib/auth/middleware';
import { deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary/config';
import { getMenuItems } from '@/lib/db/menu';

// Get all menu items for a cafe (Public)
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category') || undefined;
    const idsParam = searchParams.get('ids');

    let ids: string[] | undefined = undefined;
    if (idsParam) {
      ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
    }

    const data = await getMenuItems(slug, category, ids);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create menu item (cafe admin only)
export const POST = withCafeAccess(async (
  req: AuthRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();

    const body = await req.json();
    if (!body?.imageUrl || typeof body.imageUrl !== 'string' || body.imageUrl.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Image is required' },
        { status: 400 }
      );
    }

    // Check if item with same name exists
    const existingItem = await MenuItem.findOne({
      cafeSlug: params.slug,
      name: body.name,
    });

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: 'Item with this name already exists' },
        { status: 400 }
      );
    }

    const menuItem = await MenuItem.create({
      ...body,
      cafeSlug: params.slug,
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem,
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

const parseRequestBody = async (req: NextRequest) => {
  try {
    const contentLength = req.headers.get('content-length');
    if (!contentLength || Number(contentLength) === 0) return {};
    return await req.json();
  } catch {
    return {};
  }
};

// Update menu item
export const PUT = withCafeAccess(async (
  req: AuthRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const body = await parseRequestBody(req);
    let itemId = searchParams.get('id');
    if (!itemId && body?.id) {
      itemId = body.id;
    }

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Item ID required' },
        { status: 400 }
      );
    }

    const current = await MenuItem.findOne({ _id: itemId, cafeSlug: params.slug });

    if (body?.name) {
      // Check if item with same name exists (excluding current item)
      const existingItem = await MenuItem.findOne({
        cafeSlug: params.slug,
        name: body.name,
        _id: { $ne: itemId },
      });

      if (existingItem) {
        return NextResponse.json(
          { success: false, message: 'Item with this name already exists' },
          { status: 400 }
        );
      }
    }

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: itemId, cafeSlug: params.slug },
      body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return NextResponse.json(
        { success: false, message: 'Menu item not found' },
        { status: 404 }
      );
    }

    if (current && body.imageUrl && current.imageUrl && body.imageUrl !== current.imageUrl) {
      if (current.imageUrl.includes('res.cloudinary.com')) {
        const pid = extractPublicId(current.imageUrl);
        if (pid) await deleteFromCloudinary(pid);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem,
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Delete menu item
export const DELETE = withCafeAccess(async (
  req: AuthRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const body = await parseRequestBody(req);
    let itemId = searchParams.get('id');
    if (!itemId && body?.id) {
      itemId = body.id;
    }

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Item ID required' },
        { status: 400 }
      );
    }

    const menuItem = await MenuItem.findOneAndDelete({
      _id: itemId,
      cafeSlug: params.slug,
    });

    if (!menuItem) {
      return NextResponse.json(
        { success: false, message: 'Menu item not found' },
        { status: 404 }
      );
    }

    if (menuItem.imageUrl && menuItem.imageUrl.includes('res.cloudinary.com')) {
      const pid = extractPublicId(menuItem.imageUrl);
      if (pid) await deleteFromCloudinary(pid);
    }

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});
