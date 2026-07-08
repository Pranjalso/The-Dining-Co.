import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPasswordResetDocument extends Document {
  cafeSlug: string;
  email: string;
  otpHash: string;
  expiresAt: Date;
  used: boolean;
  compareOtp(otp: string): Promise<boolean>;
}

const PasswordResetSchema = new Schema<IPasswordResetDocument>(
  {
    cafeSlug: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PasswordResetSchema.methods.compareOtp = async function (otp: string): Promise<boolean> {
  return bcrypt.compare(otp, this.otpHash);
};

PasswordResetSchema.index({ cafeSlug: 1, email: 1, expiresAt: -1 });

export default mongoose.models.PasswordReset || mongoose.model<IPasswordResetDocument>('PasswordReset', PasswordResetSchema);
