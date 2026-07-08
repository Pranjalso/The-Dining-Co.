import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Cafe from '@/lib/db/models/Cafe';
import Admin from '@/lib/db/models/Admin';
import { withAuth } from '@/lib/auth/middleware';
import { AuthRequest } from '@/lib/auth/middleware';
import slugify from 'slugify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendCafeWelcomeEmail } from '@/lib/email/mailer';

export const runtime = 'nodejs';

// Get all cafes (with filters)
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const city = searchParams.get('city');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query: any = {};

    if (city && city !== 'All Cities') {
      query.city = city;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { cafeName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const cafes = await Cafe.find(query).sort({ createdAt: -1 });

    // Get counts - include expired in inactive count for accuracy
    const now = new Date();
    const totalCafes = await Cafe.countDocuments();
    
    // Active means isActive is true AND (subscription is Lifetime OR endDate is in the future)
    const activeCafes = await Cafe.countDocuments({ 
      isActive: true,
      $or: [
        { subscriptionPlan: 'Lifetime' },
        { endDate: { $gt: now } }
      ]
    });
    
    // Inactive means isActive is false OR (subscription is not Lifetime AND endDate is in the past)
    const inactiveCafes = totalCafes - activeCafes;

    return NextResponse.json({
      success: true,
      data: cafes || [], // Always return an array
      stats: {
        total: totalCafes || 0,
        active: activeCafes || 0,
        inactive: inactiveCafes || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching cafes:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requireAdmin: true });

// Create new cafe
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const body = await req.json();

    // Validate payload
    const schema = z.object({
      cafeName: z.string().min(1),
      ownerName: z.string().min(1),
      email: z.string().email(),
      city: z.string().min(1),
      location: z.string().min(1),
      subscriptionPlan: z.enum(['Demo (1 Day)', 'Demo (7 Days)', '1 Month', '3 Months', '6 Months', '12 Months', 'Lifetime']),
      startDate: z.string().min(1),
      endDate: z.string().min(1),
      contactNumber: z.string().min(1),
      username: z.string().min(3),
      password: z.string().min(6),
    });
    
    const parsed = schema.parse(body);

    // Generate slug
    const slug = slugify(parsed.cafeName, {
      lower: true,
      strict: true,
    });

    // Check if slug exists
    const existingCafe = await Cafe.findOne({ slug });
    if (existingCafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe with this name already exists' },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingUsername = await Cafe.findOne({ username: parsed.username });
    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: 'Username already taken' },
        { status: 400 }
      );
    }
    
    // Also ensure Admin username does not exist to avoid duplicate key error
    const existingAdmin = await Admin.findOne({ username: parsed.username });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Username already taken' },
        { status: 400 }
      );
    }

    // Hash password for Cafe record
    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    let cafe: any = null;
    
    try {
      cafe = await Cafe.create({
        cafeName: parsed.cafeName,
        ownerName: parsed.ownerName,
        email: parsed.email,
        city: parsed.city,
        location: parsed.location,
        subscriptionPlan: parsed.subscriptionPlan,
        contactNumber: parsed.contactNumber,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        slug,
        username: parsed.username,
        password: hashedPassword,
        isActive: true,
      });

      // Create admin user for cafe
      const admin = new Admin({
        username: parsed.username,
        password: parsed.password, // Will be hashed by pre-save hook
        role: 'cafeadmin',
        cafeSlug: slug,
      });
      await admin.save();
    } catch (createError) {
      // Remove cafe if admin creation failed after cafe creation
      if (cafe && cafe._id) {
        await Cafe.findByIdAndDelete(cafe._id);
      }
      throw createError;
    }

    // Prepare base URL for links
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'https://smart-dini-backend.vercel.app';
    const origin = `${protocol}://${host}`;

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      origin ||
      'https://smart-dini-backend.vercel.app';

    const menuUrl = `${baseUrl}/${slug}/menu`;
    const adminUrl = `${baseUrl}/${slug}/admin`;

    // Send welcome email (non-blocking)
    let emailSent = false;
    try {
      await sendCafeWelcomeEmail({
        to: parsed.email,
        cafeName: parsed.cafeName,
        ownerName: parsed.ownerName,
        menuUrl,
        adminUrl,
      });
      emailSent = true;
      console.log(`[email] Welcome email sent to ${parsed.email}`);
    } catch (e) {
      const err = e as Error;
      emailSent = false;
      console.error(`[email] Failed to send welcome email to ${parsed.email}: ${err.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Cafe created successfully',
      data: cafe,
      links: {
        menu: menuUrl,
        admin: adminUrl,
      },
      emailSent,
    });
    
  } catch (error) {
    console.error('Error creating cafe:', error);
    
    // If zod validation fails, return 400
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors from MongoDB
    const anyErr = error as any;
    if (anyErr && anyErr.code === 11000) {
      const pattern = anyErr.keyPattern || {};
      let message = 'Duplicate key';
      if (pattern.username) message = 'Username already taken';
      else if (pattern.slug) message = 'Cafe with this name already exists';
      return NextResponse.json({ success: false, message }, { status: 409 });
    }
    
    // Handle MongoDB connection errors
    if (error instanceof Error && error.message.includes('MongoDB')) {
      return NextResponse.json(
        { success: false, message: 'Database connection error. Please try again.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}, { requireAdmin: true });