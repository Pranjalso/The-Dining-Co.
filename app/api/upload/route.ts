import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AuthRequest } from '@/lib/auth/middleware';
import { uploadToCloudinary } from '@/lib/cloudinary/config';

export const POST = withAuth(async (req: AuthRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const folder = req.user?.role === 'superadmin' 
      ? 'smartdini/cafes' 
      : `smartdini/${req.user?.cafeSlug}`;
    
    const imageUrl = await uploadToCloudinary(buffer, folder);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: { url: imageUrl },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});