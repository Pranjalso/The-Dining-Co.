import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { withCafeAccess } from '@/lib/auth/middleware';
import { AuthRequest } from '@/lib/auth/middleware';

export const GET = withCafeAccess(async (
  req: AuthRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const period = searchParams.get('period') || 'today';
    const date = searchParams.get('date');
    const slug = params.slug;

    let startDate, endDate;

    // Base the date calculations on the provided date string if available, otherwise use today
    const baseDate = date ? new Date(date) : new Date();
    if (isNaN(baseDate.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date provided' }, { status: 400 });
    }

    if (period === 'today' || period === 'custom') {
      startDate = new Date(baseDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(baseDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'yesterday') {
      const yesterday = new Date(baseDate);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = new Date(yesterday);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(yesterday);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === '7d') {
      endDate = new Date(baseDate);
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date(baseDate);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '30d') {
      endDate = new Date(baseDate);
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date(baseDate);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }

    const query: any = {
      cafeSlug: slug,
    };

    if (period !== 'overall') {
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Use aggregation for much faster results directly from MongoDB
    const [statsResult] = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] }
          },
          preparing: {
            $sum: { $cond: [{ $in: ['$orderStatus', ['preparing', 'ready']] }, 1, 0] }
          },
          served: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'served'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = statsResult || {
      total: 0,
      pending: 0,
      preparing: 0,
      served: 0,
      completed: 0,
      cancelled: 0,
    };

    // Generate chart data efficiently using aggregation
    let chartData: any[] = [];
    if (period === 'today' || period === 'yesterday' || (period === 'custom' && date)) {
      const hourlyAggregation = await Order.aggregate([
        { $match: query },
        {
          $project: {
            hour: { $hour: '$createdAt' }
          }
        },
        {
          $group: {
            _id: '$hour',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
      chartData = hours.map(h => {
        const matchingHour = hourlyAggregation.find(item => item._id >= h && item._id < h + 2);
        const count = hourlyAggregation
          .filter(item => item._id >= h && item._id < h + 2)
          .reduce((sum, item) => sum + item.count, 0);
        
        const periodSuffix = h >= 12 ? 'pm' : 'am';
        const displayHour = h === 0 ? 12 : (h > 12 ? h - 12 : h);
        return { name: `${displayHour}.00 ${periodSuffix}`, orders: count };
      });
    } else {
      const dailyAggregation = await Order.aggregate([
        { $match: query },
        {
          $project: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          }
        },
        {
          $group: {
            _id: '$date',
            count: { $sum: 1 }
          }
        }
      ]);

      // For overall, 30d, 7d - we show the appropriate day range
      const days = period === '7d' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayMatch = dailyAggregation.find(item => item._id === dateStr);
        chartData.push({ 
          name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
          orders: dayMatch ? dayMatch.count : 0 
        });
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      chartData
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});
