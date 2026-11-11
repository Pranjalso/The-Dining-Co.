import mongoose, { Schema, Document } from 'mongoose';

export type ServiceRequestType = 'water' | 'cutlery' | 'bill' | 'cleaning' | 'waiter';
export type ServiceRequestStatus = 'pending' | 'acknowledged' | 'completed' | 'cancelled';

export interface IServiceRequestDocument extends Document {
  cafeSlug: string;
  tableNumber: string;
  requestType: ServiceRequestType;
  customNote?: string;
  paymentMethodPreference?: 'cash' | 'upi';
  status: ServiceRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequestDocument>(
  {
    cafeSlug: {
      type: String,
      required: [true, 'Cafe slug is required'],
      index: true,
      trim: true,
      lowercase: true,
    },
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
      trim: true,
    },
    requestType: {
      type: String,
      enum: ['water', 'cutlery', 'bill', 'cleaning', 'waiter'],
      required: [true, 'Request type is required'],
      default: 'waiter',
    },
    customNote: {
      type: String,
      trim: true,
      maxlength: [300, 'Custom note cannot exceed 300 characters'],
      default: '',
    },
    paymentMethodPreference: {
      type: String,
      enum: ['cash', 'upi'],
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying active requests per cafe efficiently
ServiceRequestSchema.index({ cafeSlug: 1, status: 1, createdAt: -1 });

export default mongoose.models.ServiceRequest ||
  mongoose.model<IServiceRequestDocument>('ServiceRequest', ServiceRequestSchema);

