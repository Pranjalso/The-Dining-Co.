import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminDocument extends Document {
  username: string;
  password: string;
  role: 'superadmin' | 'cafeadmin';
  cafeSlug?: string;
  tokenVersion?: number;
  passwordChangedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['superadmin', 'cafeadmin'],
      required: true,
      default: 'cafeadmin',
    },
    cafeSlug: {
      type: String,
      sparse: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  this.tokenVersion = (this.tokenVersion ?? 0) + 1;
});

// Compare password method
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Prevent mongoose from creating multiple models
export default mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);
