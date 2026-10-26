import mongoose, { Schema, Document } from 'mongoose';

export interface IRatingDocument extends Document {
  cafeSlug: string;
  orderNumber?: number;
  tableNumber?: string;
  customerName?: string;
  rating: number; // 1 to 5
  feedback?: string;
  tags?: string[];
  serviceRating?: number;
  foodRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRatingDocument>(
  {
    cafeSlug: {
      type: String,
      required: [true, 'Cafe slug is required'],
      index: true,
      trim: true,
    },
    orderNumber: {
      type: Number,
      index: true,
    },
    tableNumber: {
      type: String,
      default: '',
      trim: true,
    },
    customerName: {
      type: String,
      default: 'Guest',
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    serviceRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    foodRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound indexes
RatingSchema.index({ cafeSlug: 1, createdAt: -1 });
RatingSchema.index({ cafeSlug: 1, rating: -1 });

export default mongoose.models.Rating || mongoose.model<IRatingDocument>('Rating', RatingSchema);
