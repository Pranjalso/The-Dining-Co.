import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';

export const dynamic = 'force-dynamic';

// GET /api/orders/[slug]/tab?table=Table%204
// Retrieves all active orders (unpaid or currently active) for a specific table
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const tableNumber = searchParams.get('table');

    if (!tableNumber) {
      return NextResponse.json(
        { success: false, message: 'Table number is required' },
        { status: 400 }
      );
    }

    const cleanTable = String(tableNumber).trim();

    // Find active orders for this table in this cafe:
    // Active means: not cancelled, and payment is still pending (or served within last 2 hours without completed payment)
    const activeOrders = await Order.find({
      cafeSlug: params.slug,
      tableNumber: cleanTable,
      orderStatus: { $ne: 'cancelled' },
      paymentStatus: 'pending',
    }).sort({ createdAt: 1 });

    if (!activeOrders || activeOrders.length === 0) {
      return NextResponse.json({
        success: true,
        hasActiveTab: false,
        data: null,
      });
    }

    // Combine all rounds into a single unified table tab
    const primaryOrder = activeOrders[0];
    const allItems: any[] = [];
    let combinedSubtotal = 0;
    let combinedDiscount = 0;
    let combinedTax = 0;
    let combinedTotal = 0;

    const rounds = activeOrders.map((ord, idx) => {
      combinedSubtotal += ord.subtotal || 0;
      combinedDiscount += ord.discount || 0;
      combinedTax += ord.tax || 0;
      combinedTotal += ord.total || 0;

      ord.items.forEach((item: any) => {
        allItems.push({
          roundNumber: idx + 1,
          orderNumber: ord.orderNumber,
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedModifiers: item.selectedModifiers,
          orderStatus: ord.orderStatus,
        });
      });

      return {
        orderId: ord._id,
        orderNumber: ord.orderNumber,
        roundNumber: idx + 1,
        itemsCount: ord.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0),
        subtotal: ord.subtotal,
        tax: ord.tax,
        total: ord.total,
        orderStatus: ord.orderStatus,
        createdAt: ord.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      hasActiveTab: true,
      data: {
        cafeSlug: params.slug,
        tableNumber: cleanTable,
        primaryOrderNumber: primaryOrder.orderNumber,
        primaryOrderId: primaryOrder._id,
        totalRounds: activeOrders.length,
        rounds,
        items: allItems,
        subtotal: combinedSubtotal,
        discount: combinedDiscount,
        tax: combinedTax,
        total: combinedTotal,
        paymentStatus: primaryOrder.paymentStatus,
        paymentMethod: primaryOrder.paymentMethod,
        latestStatus: activeOrders[activeOrders.length - 1].orderStatus,
      },
    });
  } catch (error: any) {
    console.error('Error fetching table tab:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

