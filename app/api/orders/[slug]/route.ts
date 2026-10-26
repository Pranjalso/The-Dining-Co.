import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import MenuItem from '@/lib/db/models/MenuItem';
import Cafe from '@/lib/db/models/Cafe';
import Offer from '@/lib/db/models/Offer';
import { withCafeAccess, AuthRequest } from '@/lib/auth/middleware';
import mongoose from 'mongoose';
import { pusher } from '@/lib/pusher';

// Get orders for a cafe
export const GET = withCafeAccess(async (
  req: AuthRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = { cafeSlug: params.slug };

    if (status) {
      if (status.includes(',')) {
        query.orderStatus = { $in: status.split(',') };
      } else {
        query.orderStatus = status;
      }
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Improved date handling to be more robust
    if (date) {
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
        const startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: startDate, $lte: endDate };
      }
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999); // Ensure end date includes the full day
        query.createdAt = { $gte: start, $lte: end };
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    // Get counts
    const pendingCount = await Order.countDocuments({
      cafeSlug: params.slug,
      orderStatus: 'pending',
    });

    const preparingCount = await Order.countDocuments({
      cafeSlug: params.slug,
      orderStatus: 'preparing',
    });

    const readyCount = await Order.countDocuments({
      cafeSlug: params.slug,
      orderStatus: 'ready',
    });

    const servedCount = await Order.countDocuments({
      cafeSlug: params.slug,
      orderStatus: 'served',
    });

    const completedCount = await Order.countDocuments({
      cafeSlug: params.slug,
      paymentStatus: 'completed',
    });

    // Calculate revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.find({
      cafeSlug: params.slug,
      createdAt: { $gte: today },
      paymentStatus: 'completed',
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    return NextResponse.json({
      success: true,
      data: orders,
      stats: {
        pending: pendingCount,
        preparing: preparingCount,
        ready: readyCount,
        served: servedCount,
        completed: completedCount,
        todayRevenue,
      },
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});

// Create new order (public - no auth required)
export const POST = async (
  req: NextRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();
    const { slug } = params;
    const body = await req.json();

    const itemsInput: Array<{ menuItemId: string; quantity: number }> = Array.isArray(body.items)
      ? body.items
          .map((it: any) => ({
            menuItemId: String(it.menuItemId || it.id),
            quantity: Number(it.quantity),
          }))
          .filter((i: { menuItemId: string; quantity: number }) => i.menuItemId && i.quantity > 0)
      : [];

    if (!body.tableNumber || !body.paymentMethod || itemsInput.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid order payload' },
        { status: 400 }
      );
    }

    const ids = itemsInput.map(i => i.menuItemId).filter(id => mongoose.Types.ObjectId.isValid(id));
    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid items' },
        { status: 400 }
      );
    }
    const menuItems = await MenuItem.find({ _id: { $in: ids }, cafeSlug: slug });
    const priceMap = new Map(
      menuItems.map(mi => [String(mi._id), { name: mi.name, price: mi.price }])
    );

    const items = itemsInput
      .map(i => {
        const found = priceMap.get(String(i.menuItemId));
        if (!found) return null;
        return {
          menuItemId: i.menuItemId,
          name: found.name,
          price: found.price,
          quantity: i.quantity,
        };
      })
      .filter(Boolean) as Array<{
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
    }>;

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid items' },
        { status: 400 }
      );
    }

    // Fetch cafe settings for dynamic tax rate
    const cafe = await Cafe.findOne({ slug }).select('taxRate');
    const taxRate = cafe?.taxRate ?? 5.0; // Fallback to 5% if not found

    const subtotal = items.reduce(
      (sum: number, item) => sum + item.price * item.quantity,
      0
    );

    // Calculate Offer / Promo Code Discount
    let discount = 0;
    let discountCode = '';

    if (body.discountCode) {
      const codeClean = String(body.discountCode).trim().toUpperCase();
      const offer = await Offer.findOne({ 
        cafeSlug: slug.toLowerCase(), 
        code: codeClean, 
        isActive: true 
      });

      if (offer && (!offer.minOrderAmount || subtotal >= offer.minOrderAmount)) {
        discountCode = offer.code;
        if (offer.discountType === 'percentage') {
          const pctMatch = String(offer.discountValue).match(/\d+/);
          const pct = pctMatch ? parseInt(pctMatch[0], 10) : 10;
          discount = Math.round((subtotal * pct) / 100);
        } else if (offer.discountType === 'flat') {
          const flatMatch = String(offer.discountValue).match(/\d+/);
          const flatVal = flatMatch ? parseInt(flatMatch[0], 10) : 100;
          discount = Math.min(subtotal, flatVal);
        } else {
          const valMatch = String(offer.discountValue).match(/\d+/);
          const val = valMatch ? parseInt(valMatch[0], 10) : 50;
          discount = Math.min(subtotal, val);
        }
      } else if (typeof body.discountAmount === 'number' && body.discountAmount > 0) {
        discount = Math.min(subtotal, Math.round(body.discountAmount));
        discountCode = codeClean;
      }
    } else if (typeof body.discountAmount === 'number' && body.discountAmount > 0) {
      discount = Math.min(subtotal, Math.round(body.discountAmount));
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = Math.round(discountedSubtotal * (taxRate / 100));
    const total = discountedSubtotal + tax;

    const lastOrder = await Order.findOne({ cafeSlug: slug }).sort({ orderNumber: -1 }).select('orderNumber').lean();
    const nextOrderNumber = lastOrder && typeof lastOrder.orderNumber === 'number' ? lastOrder.orderNumber + 1 : 1000;

    const specialInstructions = body.specialInstructions || body.notes || body.description || '';

    const order = await Order.create({
      orderNumber: nextOrderNumber,
      tableNumber: String(body.tableNumber),
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus || 'pending',
      items,
      cafeSlug: slug,
      subtotal,
      discount,
      discountCode,
      tax,
      total,
      orderStatus: 'pending',
      upiId: body.upiId,
      specialInstructions,
      notes: specialInstructions,
    });

    // Trigger Pusher event
    try {
      await pusher.trigger(`cafe-${slug}`, 'new-order', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        subtotal: order.subtotal,
        discount: order.discount,
        discountCode: order.discountCode,
        total: order.total,
        specialInstructions: order.specialInstructions,
        notes: order.notes,
        timestamp: order.createdAt,
      });
    } catch (pusherError) {
      console.error('Pusher trigger failed:', pusherError);
      // Don't block the response for this, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
};

// Update order status
export const PATCH = withCafeAccess(async (
  req: AuthRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const orderId = searchParams.get('id');
    const { orderStatus, paymentStatus } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, cafeSlug: params.slug },
      updateData,
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Trigger Pusher event for customer & table real-time notification
    try {
      const isPaymentCompleted = order.paymentStatus === 'completed';
      const eventPayload = {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        isPaymentCompleted,
        isPaymentReceived: isPaymentCompleted,
        paymentMethod: order.paymentMethod,
        total: order.total,
        isRejected: order.orderStatus === 'cancelled',
        message: order.orderStatus === 'cancelled'
          ? `Your order #${order.orderNumber} for Table ${order.tableNumber} is rejected`
          : isPaymentCompleted
          ? `Payment of ₹${order.total} received! Thank you for dining with us.`
          : `Order #${order.orderNumber} status updated to ${order.orderStatus}`,
        timestamp: new Date().toISOString(),
      };

      // 1. Cafe-wide channel
      await pusher.trigger(`cafe-${params.slug}`, 'order-status-updated', eventPayload);
      if (isPaymentCompleted) {
        await pusher.trigger(`cafe-${params.slug}`, 'payment-received', eventPayload);
      }

      // 2. Specific table channel (e.g. cafe-mycafe-table-09)
      if (order.tableNumber) {
        const cleanTable = String(order.tableNumber).trim();
        await pusher.trigger(`cafe-${params.slug}-table-${cleanTable}`, 'order-status-updated', eventPayload);
        if (isPaymentCompleted) {
          await pusher.trigger(`cafe-${params.slug}-table-${cleanTable}`, 'payment-received', eventPayload);
        }
      }

      // 3. Specific order channel (e.g. order-1001)
      if (order.orderNumber) {
        await pusher.trigger(`order-${order.orderNumber}`, 'order-status-updated', eventPayload);
        if (isPaymentCompleted) {
          await pusher.trigger(`order-${order.orderNumber}`, 'payment-received', eventPayload);
        }
      }
    } catch (pusherError) {
      console.error('[Pusher] Order status update trigger failed:', pusherError);
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});
