import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import ServiceRequest, { ServiceRequestType } from '@/lib/db/models/ServiceRequest';
import Cafe from '@/lib/db/models/Cafe';
import { pusher } from '@/lib/pusher';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createRequestSchema = z.object({
  tableNumber: z.string().min(1, 'Table number is required').max(30),
  requestType: z.enum(['water', 'cutlery', 'bill', 'cleaning', 'waiter']),
  customNote: z.string().max(300).optional(),
  paymentMethodPreference: z.enum(['cash', 'upi']).optional(),
});

// GET: Fetch active (or filtered) service requests for the cafe
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    const query: Record<string, any> = { cafeSlug: slug.toLowerCase() };
    if (status !== 'all') {
      query.status = status;
    }

    const requests = await ServiceRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Customer creates a new service request from table menu
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

    // Verify cafe exists
    const cafe = await Cafe.findOne({ slug: slug.toLowerCase() }).select('_id cafeName isActive');
    if (!cafe || !cafe.isActive) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found or inactive' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = createRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues?.[0]?.message || 'Invalid input data',
        },
        { status: 400 }
      );
    }

    const { tableNumber, requestType, customNote, paymentMethodPreference } = validation.data;

    // Rate-limit: Check if table submitted identical pending request within last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const existingRecent = await ServiceRequest.findOne({
      cafeSlug: slug.toLowerCase(),
      tableNumber,
      requestType,
      status: 'pending',
      createdAt: { $gte: thirtySecondsAgo },
    });

    if (existingRecent) {
      return NextResponse.json(
        {
          success: true,
          message: 'Request already recorded, a server is on their way!',
          data: existingRecent,
        },
        { status: 200 }
      );
    }

    const serviceRequest = await ServiceRequest.create({
      cafeSlug: slug.toLowerCase(),
      tableNumber,
      requestType,
      customNote: customNote || '',
      paymentMethodPreference,
      status: 'pending',
    });

    // Realtime notification via Pusher
    try {
      await pusher.trigger(`cafe-${slug.toLowerCase()}`, 'service-request-created', {
        id: serviceRequest._id.toString(),
        tableNumber,
        requestType,
        customNote: serviceRequest.customNote,
        paymentMethodPreference,
        status: serviceRequest.status,
        createdAt: serviceRequest.createdAt,
      });
    } catch (pusherErr) {
      console.warn('Pusher trigger for service request failed:', pusherErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Service request sent successfully',
        data: serviceRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service request' },
      { status: 500 }
    );
  }
}

// PATCH: Staff marks request as acknowledged / completed
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = params;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Request ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const newStatus = body.status as string;

    if (!['acknowledged', 'completed', 'cancelled'].includes(newStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const updated = await ServiceRequest.findOneAndUpdate(
      { _id: id, cafeSlug: slug.toLowerCase() },
      {
        status: newStatus,
        ...(newStatus === 'completed' ? { completedAt: new Date() } : {}),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Service request not found' },
        { status: 404 }
      );
    }

    // Broadcast resolution to staff and customer
    try {
      await pusher.trigger(`cafe-${slug.toLowerCase()}`, 'service-request-updated', {
        id: updated._id.toString(),
        tableNumber: updated.tableNumber,
        status: updated.status,
        completedAt: updated.completedAt,
      });
    } catch (pusherErr) {
      console.warn('Pusher trigger failed on update:', pusherErr);
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating service request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service request' },
      { status: 500 }
    );
  }
}

