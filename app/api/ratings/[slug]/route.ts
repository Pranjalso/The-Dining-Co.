import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Rating from '@/lib/db/models/Rating';
import Cafe from '@/lib/db/models/Cafe';
import Order from '@/lib/db/models/Order';
import { pusher } from '@/lib/pusher';

// POST: Public endpoint for customers to submit a rating after payment/order
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
    const cafe = await Cafe.findOne({ slug: slug.toLowerCase() });
    if (!cafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { rating, feedback, customerName, tableNumber, orderNumber, tags, serviceRating, foodRating } = body;

    // Validate rating
    const numRating = Number(rating);
    if (!numRating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    // Sanitize string inputs
    const cleanCustomerName = customerName ? String(customerName).trim().slice(0, 60) : 'Guest';
    const cleanFeedback = feedback ? String(feedback).trim().slice(0, 1000) : '';
    const cleanTable = tableNumber ? String(tableNumber).trim().slice(0, 20) : '';
    const cleanOrderNumber = orderNumber ? Number(orderNumber) : undefined;
    const cleanTags = Array.isArray(tags) ? tags.filter(t => typeof t === 'string').slice(0, 10) : [];

    // Optional check: if orderNumber given, check if already rated
    if (cleanOrderNumber) {
      const existing = await Rating.findOne({
        cafeSlug: slug.toLowerCase(),
        orderNumber: cleanOrderNumber,
      });

      if (existing) {
        // Update existing rating instead of creating duplicate
        existing.rating = numRating;
        existing.feedback = cleanFeedback;
        existing.customerName = cleanCustomerName;
        existing.tableNumber = cleanTable || existing.tableNumber;
        existing.tags = cleanTags;
        if (serviceRating) existing.serviceRating = Math.min(5, Math.max(1, Number(serviceRating)));
        if (foodRating) existing.foodRating = Math.min(5, Math.max(1, Number(foodRating)));
        await existing.save();

        // Trigger real-time update
        try {
          await pusher.trigger(`cafe-${slug.toLowerCase()}`, 'new-rating', {
            id: existing._id,
            rating: existing.rating,
            customerName: existing.customerName,
            tableNumber: existing.tableNumber,
            orderNumber: existing.orderNumber,
            feedback: existing.feedback,
            tags: existing.tags,
            createdAt: existing.createdAt,
            isUpdate: true,
          });
        } catch (pusherErr) {
          console.warn('Pusher rating notification failed:', pusherErr);
        }

        return NextResponse.json({
          success: true,
          message: 'Thank you! Your rating has been updated.',
          data: existing,
          isUpdate: true,
        });
      }
    }

    // Create new rating
    const newRating = await Rating.create({
      cafeSlug: slug.toLowerCase(),
      orderNumber: cleanOrderNumber,
      tableNumber: cleanTable,
      customerName: cleanCustomerName,
      rating: numRating,
      feedback: cleanFeedback,
      tags: cleanTags,
      serviceRating: serviceRating ? Math.min(5, Math.max(1, Number(serviceRating))) : undefined,
      foodRating: foodRating ? Math.min(5, Math.max(1, Number(foodRating))) : undefined,
    });

    // Trigger real-time Pusher event for cafe admin
    try {
      await pusher.trigger(`cafe-${slug.toLowerCase()}`, 'new-rating', {
        id: newRating._id,
        rating: newRating.rating,
        customerName: newRating.customerName,
        tableNumber: newRating.tableNumber,
        orderNumber: newRating.orderNumber,
        feedback: newRating.feedback,
        tags: newRating.tags,
        createdAt: newRating.createdAt,
        isUpdate: false,
      });
    } catch (pusherErr) {
      console.warn('Pusher rating notification failed:', pusherErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your rating!',
      data: newRating,
    });
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

// GET: Fetch ratings and summary stats for a cafe (used by cafe admin and public overview)
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = params;
    const { searchParams } = req.nextUrl;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Cafe slug is required' },
        { status: 400 }
      );
    }

    const ratingFilter = searchParams.get('filter'); // '5', '4', '3', '2', '1', or 'all'
    const searchQuery = searchParams.get('search')?.trim();
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));

    const baseQuery: any = { cafeSlug: slug.toLowerCase() };

    // Calculate aggregated statistics across ALL ratings for this cafe
    const [statsResult] = await Rating.aggregate([
      { $match: { cafeSlug: slug.toLowerCase() } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          withFeedbackCount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$feedback', ''] }, { $ne: ['$feedback', null] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Tag counts aggregation
    const tagAggregation = await Rating.aggregate([
      { $match: { cafeSlug: slug.toLowerCase() } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const stats = {
      total: statsResult?.total || 0,
      average: statsResult?.avgRating ? Number(statsResult.avgRating.toFixed(1)) : 5.0,
      distribution: {
        5: statsResult?.fiveStar || 0,
        4: statsResult?.fourStar || 0,
        3: statsResult?.threeStar || 0,
        2: statsResult?.twoStar || 0,
        1: statsResult?.oneStar || 0,
      },
      withFeedbackCount: statsResult?.withFeedbackCount || 0,
      topTags: tagAggregation.map(t => ({ tag: t._id, count: t.count })),
    };

    // Build query for list
    const listQuery: any = { ...baseQuery };

    if (ratingFilter && ratingFilter !== 'all') {
      const parsedRating = Number(ratingFilter);
      if (parsedRating >= 1 && parsedRating <= 5) {
        listQuery.rating = parsedRating;
      }
    }

    if (searchQuery) {
      const searchNum = Number(searchQuery);
      const orConditions: any[] = [
        { customerName: { $regex: searchQuery, $options: 'i' } },
        { feedback: { $regex: searchQuery, $options: 'i' } },
        { tableNumber: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } },
      ];
      if (!isNaN(searchNum)) {
        orConditions.push({ orderNumber: searchNum });
      }
      listQuery.$or = orConditions;
    }

    const ratings = await Rating.find(listQuery)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      stats,
      data: ratings,
    });
  } catch (error: any) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}
