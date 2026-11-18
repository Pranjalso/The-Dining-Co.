import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const result: any = {
    timestamp: new Date().toISOString(),
    env: {
      has_MONGODB_URI: !!process.env.MONGODB_URI,
      uri_start: process.env.MONGODB_URI ? process.env.MONGODB_URI.slice(0, 18) + '...' : null,
      has_JWT_SECRET: !!process.env.JWT_SECRET,
      has_JWT_REFRESH_SECRET: !!process.env.JWT_REFRESH_SECRET,
      has_SUPERADMIN_USERNAME: !!process.env.SUPERADMIN_USERNAME,
      has_SUPERADMIN_PASSWORD: !!process.env.SUPERADMIN_PASSWORD,
      node_env: process.env.NODE_ENV,
    },
    mongo: {
      readyState: mongoose.connection.readyState,
    }
  };

  if (!process.env.MONGODB_URI) {
    result.mongo.error = 'MONGODB_URI is not set in environment';
    return NextResponse.json(result, { status: 500 });
  }

  try {
    const start = Date.now();
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    result.mongo.connected = true;
    result.mongo.connectDurationMs = Date.now() - start;

    // Try finding cafe
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      result.mongo.collections = collections.map(c => c.name);

      const cafe = await db.collection('cafes').findOne({ slug: 'ignite-aeros' });
      result.mongo.igniteAerosCafe = cafe ? {
        _id: cafe._id,
        slug: cafe.slug,
        cafeName: cafe.cafeName,
        username: cafe.username,
        isActive: cafe.isActive,
        endDate: cafe.endDate,
        hasPassword: !!cafe.password,
      } : null;

      const admin = await db.collection('admins').findOne({
        $or: [{ username: 'IgniteAeros' }, { cafeSlug: 'ignite-aeros' }]
      });
      result.mongo.igniteAerosAdmin = admin ? {
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        cafeSlug: admin.cafeSlug,
        hasPassword: !!admin.password,
      } : null;
    }
    return NextResponse.json(result);
  } catch (err: any) {
    result.mongo.error = err.message;
    result.mongo.name = err.name;
    result.mongo.code = err.code;
    return NextResponse.json(result, { status: 500 });
  }
}
