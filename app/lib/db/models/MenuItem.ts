import mongoose, { Schema, Document } from 'mongoose';

export interface IModifierOption {
  name: string;
  price: number;
}

export interface IModifierGroup {
  name: string; // e.g. "Milk Choice", "Temperature & Size", "Add-ons"
  minSelect?: number; // 0 for optional, 1 for required
  maxSelect?: number; // 1 for radio/single choice, >1 for multiple checkboxes
  options: IModifierOption[];
}

export interface IMenuItemDocument extends Document {
  cafeSlug: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl: string;
  isAvailable: boolean;
  modifierGroups?: IModifierGroup[];
}

const ModifierOptionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false }
);

const ModifierGroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    minSelect: { type: Number, default: 0, min: 0 },
    maxSelect: { type: Number, default: 1, min: 1 },
    options: [ModifierOptionSchema],
  },
  { _id: false }
);

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
    modifierGroups: [ModifierGroupSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for cafe's menu items
MenuItemSchema.index({ cafeSlug: 1, category: 1 });
MenuItemSchema.index({ cafeSlug: 1, name: 1 }, { unique: true });

export default mongoose.models.MenuItem || mongoose.model<IMenuItemDocument>('MenuItem', MenuItemSchema);
