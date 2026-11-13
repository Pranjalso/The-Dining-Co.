
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { withCafeAccess, AuthRequest } from '@/lib/auth/middleware';

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

    // Extract optional client timezone offset in minutes (e.g. -330 for IST = UTC+5:30)
    const tzOffsetParam = searchParams.get('tzOffset');
    const tzOffsetMinutes = tzOffsetParam !== null ? Number(tzOffsetParam) : -new Date().getTimezoneOffset();

    // Parse "YYYY-MM-DD" accurately
    const parseLocalDate = (dateStr?: string | null) => {
      if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return { y, m, d };
      }
      const now = new Date();
      const clientNow = new Date(now.getTime() - tzOffsetMinutes * 60000);
      return { y: clientNow.getUTCFullYear(), m: clientNow.getUTCMonth() + 1, d: clientNow.getUTCDate() };
    };

    let target = parseLocalDate(date);

    if (period === 'yesterday' && !date) {
      const d = new Date(Date.UTC(target.y, target.m - 1, target.d));
      d.setUTCDate(d.getUTCDate() - 1);
      target = { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
    }

    // Precise UTC millisecond bounds based on client local midnight
    const clientMidnightUtcMs = Date.UTC(target.y, target.m - 1, target.d, 0, 0, 0, 0) + (tzOffsetMinutes * 60000);

    let startMs: number, endMs: number;
    if (period === 'today' || period === 'yesterday' || period === 'custom') {
      startMs = clientMidnightUtcMs;
      endMs = clientMidnightUtcMs + 86400000 - 1;
    } else if (period === '7d') {
      endMs = clientMidnightUtcMs + 86400000 - 1;
      startMs = clientMidnightUtcMs - (6 * 86400000);
    } else if (period === '30d') {
      endMs = clientMidnightUtcMs + 86400000 - 1;
      startMs = clientMidnightUtcMs - (29 * 86400000);
    } else {
      startMs = clientMidnightUtcMs;
      endMs = clientMidnightUtcMs + 86400000 - 1;
    }

    startDate = new Date(startMs);
    endDate = new Date(endMs);

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
      // Calculate timezone string for MongoDB (e.g. "+05:30" or "-05:00")
      const totalMinutesAhead = -tzOffsetMinutes;
      const sign = totalMinutesAhead >= 0 ? '+' : '-';
      const absMinutes = Math.abs(totalMinutesAhead);
      const tzHours = String(Math.floor(absMinutes / 60)).padStart(2, '0');
      const tzMins = String(absMinutes % 60).padStart(2, '0');
      const mongoTz = `${sign}${tzHours}:${tzMins}`;

      const hourlyAggregation = await Order.aggregate([
        { $match: query },
        {
          $project: {
            hour: { $hour: { date: '$createdAt', timezone: mongoTz } }
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
        const count = hourlyAggregation
          .filter(item => item._id >= h && item._id < h + 2)
          .reduce((sum, item) => sum + item.count, 0);
        
        const periodSuffix = h >= 12 ? 'pm' : 'am';
        const displayHour = h === 0 ? 12 : (h > 12 ? h - 12 : h);
        return { name: `${displayHour}.00 ${periodSuffix}`, orders: count };
      });
    } else {
      const totalMinutesAhead = -tzOffsetMinutes;
      const sign = totalMinutesAhead >= 0 ? '+' : '-';
      const absMinutes = Math.abs(totalMinutesAhead);
      const tzHours = String(Math.floor(absMinutes / 60)).padStart(2, '0');
      const tzMins = String(absMinutes % 60).padStart(2, '0');
      const mongoTz = `${sign}${tzHours}:${tzMins}`;

      const dailyAggregation = await Order.aggregate([
        { $match: query },
        {
          $project: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: mongoTz } }
          }
        },
        {
          $group: {
            _id: '$date',
            count: { $sum: 1 }
          }
        }
      ]);

      // For overall, 30d, 7d - we show the appropriate day range in local time
      const days = period === '7d' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.UTC(target.y, target.m - 1, target.d));
        d.setUTCDate(d.getUTCDate() - i);
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        const dayMatch = dailyAggregation.find(item => item._id === dateStr);
        chartData.push({ 
          name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }), 
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
