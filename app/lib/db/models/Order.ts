import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderDocument extends Document {
  cafeSlug: string;
  orderNumber: number;
  tableNumber: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'upi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  upiId?: string;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    cafeSlug: {
      type: String,
      required: [true, 'Cafe slug is required'],
      index: true,
    },
    orderNumber: {
      type: Number,
      required: true,
    },
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
    },
    items: [
      {
        menuItemId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
      default: 'pending',
    },
    upiId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for cafe's orders
OrderSchema.index({ cafeSlug: 1, orderNumber: -1 });
OrderSchema.index({ cafeSlug: 1, orderStatus: 1 });
OrderSchema.index({ cafeSlug: 1, paymentStatus: 1 });
OrderSchema.index({ cafeSlug: 1, createdAt: -1 });

// Auto-increment order number per cafe
OrderSchema.pre('save', async function (this: any) {
  if (this.isNew) {
    const lastOrder = await mongoose.model('Order')
      .findOne({ cafeSlug: this.cafeSlug })
      .sort({ orderNumber: -1 });
    
    this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1000;
  }
});

export default mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
