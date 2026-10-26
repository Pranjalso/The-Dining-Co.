import mongoose, { Schema, Document } from 'mongoose';

export type OfferDiscountType = 'percentage' | 'flat' | 'combo' | 'bogo' | 'custom';

export interface IOfferDocument extends Document {
  cafeSlug: string;
  title: string;
  description: string;
  discountType: OfferDiscountType;
  discountValue: string; // e.g. "20%", "₹100", "₹299", "BOGO"
  code?: string; // Optional coupon code, e.g. "DINING20"
  minOrderAmount?: number; // e.g. 499
  badgeText?: string; // e.g. "SPECIAL OFFER", "HOT DEAL", "WEEKEND COMBO"
  isActive: boolean;
  validTill?: Date;
  applicableItems?: string[];
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOfferDocument>(
  {
    cafeSlug: {
      type: String,
      required: [true, 'Cafe slug is required'],
      index: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat', 'combo', 'bogo', 'custom'],
      default: 'percentage',
    },
    discountValue: {
      type: String,
      required: [true, 'Discount value is required'],
      trim: true,
    },
    code: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    badgeText: {
      type: String,
      default: 'SPECIAL OFFER',
      trim: true,
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    validTill: {
      type: Date,
    },
    applicableItems: {
      type: [String],
      default: [],
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by cafe and active status
OfferSchema.index({ cafeSlug: 1, isActive: 1, createdAt: -1 });

export default mongoose.models.Offer || mongoose.model<IOfferDocument>('Offer', OfferSchema);
