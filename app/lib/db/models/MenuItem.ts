import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItemDocument extends Document {
  cafeSlug: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl: string;
  isAvailable: boolean;
}

const MenuItemSchema = new Schema<IMenuItemDocument>(
  {
    cafeSlug: {
      type: String,
      required: [true, 'Cafe slug is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for cafe's menu items
MenuItemSchema.index({ cafeSlug: 1, category: 1 });
MenuItemSchema.index({ cafeSlug: 1, name: 1 }, { unique: true });

export default mongoose.models.MenuItem || mongoose.model<IMenuItemDocument>('MenuItem', MenuItemSchema);
