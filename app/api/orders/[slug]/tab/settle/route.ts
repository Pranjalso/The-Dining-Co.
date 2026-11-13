import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { pusher } from '@/lib/pusher';
import { withCafeAccess, AuthRequest } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

// Settle entire table tab (mark all unpaid rounds for this table as completed)
export const POST = withCafeAccess(async (
  req: AuthRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();
    const body = await req.json();
    const tableNumber = body.tableNumber;
    const paymentMethod = body.paymentMethod || 'cash';

    if (!tableNumber) {
      return NextResponse.json(
        { success: false, message: 'Table number is required' },
        { status: 400 }
      );
    }

    const cleanTable = String(tableNumber).trim();

    // Find all pending orders for this table
    const orders = await Order.find({
      cafeSlug: params.slug,
      tableNumber: cleanTable,
      orderStatus: { $ne: 'cancelled' },
      paymentStatus: 'pending',
    });

    if (orders.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No active unpaid tab found for this table',
      }, { status: 404 });
    }

    const orderNumbers = orders.map(o => o.orderNumber);
    const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Update all to completed
    await Order.updateMany(
      {
        cafeSlug: params.slug,
        tableNumber: cleanTable,
        orderStatus: { $ne: 'cancelled' },
        paymentStatus: 'pending',
      },
      {
        $set: {
          paymentStatus: 'completed',
          paymentMethod: paymentMethod,
        },
      }
    );

    // Trigger Pusher notifications
    try {
      await pusher.trigger(`cafe-${params.slug}`, 'payment-received', {
        tableNumber: cleanTable,
        orderNumbers,
        total: totalAmount,
        isPaymentCompleted: true,
        paymentStatus: 'completed',
        timestamp: new Date().toISOString(),
      });

      await pusher.trigger(`cafe-${params.slug}-table-${cleanTable}`, 'payment-received', {
        tableNumber: cleanTable,
        orderNumbers,
        total: totalAmount,
        isPaymentCompleted: true,
        paymentStatus: 'completed',
        timestamp: new Date().toISOString(),
      });

      for (const num of orderNumbers) {
        await pusher.trigger(`order-${num}`, 'payment-received', {
          orderNumber: num,
          tableNumber: cleanTable,
          total: totalAmount,
          isPaymentCompleted: true,
          paymentStatus: 'completed',
        });
      }
    } catch (e) {
      console.error('Error triggering settlement Pusher events:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Table ${cleanTable} tab settled successfully (${orders.length} orders)`,
      data: {
        tableNumber: cleanTable,
        orderNumbers,
        totalAmount,
      },
    });
  } catch (error: any) {
    console.error('Error settling table tab:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
});

