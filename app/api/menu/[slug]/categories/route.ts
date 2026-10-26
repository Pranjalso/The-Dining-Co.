import { NextRequest, NextResponse } from 'next/server';
import { getMenuCategories } from '@/lib/db/menu';

// Aggregate distinct categories for a cafe (Public)
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
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
