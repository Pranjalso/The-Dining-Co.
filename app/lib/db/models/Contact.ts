import mongoose, { Schema, Document } from 'mongoose';

export interface IContactDocument extends Document {
  fullName: string;
  contactNumber: string;
  email: string;
  city: string;
  cafeRestaurantName: string;
  needs: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContactDocument>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    cafeRestaurantName: {
      type: String,
      required: [true, 'Cafe/Restaurant name is required'],
      trim: true,
    },
    needs: {
      type: String,
      required: [true, 'Requirements description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'archived'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
ContactSchema.index({ email: 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ createdAt: -1 });

export default mongoose.models.Contact || mongoose.model<IContactDocument>('Contact', ContactSchema);