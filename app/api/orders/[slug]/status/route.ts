import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const orderNumber = searchParams.get('orderNumber');
    const orderId = searchParams.get('id');
    const tableNumber = searchParams.get('table');

    const query: any = { cafeSlug: params.slug };

    if (orderId) {
      query._id = orderId;
    } else if (orderNumber) {
      query.orderNumber = Number(orderNumber);
    } else if (tableNumber) {
      query.tableNumber = String(tableNumber);
    } else {
      return NextResponse.json(
        { success: false, message: 'orderNumber, id, or table required' },
        { status: 400 }
      );
    }

    const order = await Order.findOne(query).sort({ createdAt: -1 });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        total: order.total,
        items: order.items,
        specialInstructions: order.specialInstructions || order.notes || '',
        notes: order.notes || order.specialInstructions || '',
        createdAt: order.createdAt,
        isRejected: order.orderStatus === 'cancelled',
        message: order.orderStatus === 'cancelled' 
          ? `Your order #${order.orderNumber} for Table ${order.tableNumber} is rejected` 
          : undefined,
      },
    });
  } catch (error: any) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
