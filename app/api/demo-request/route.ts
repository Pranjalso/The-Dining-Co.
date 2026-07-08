
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendDemoRequestEmail } from '@/lib/email/mailer';

const demoRequestSchema = z.object({
  cafeName: z.string().min(1, "Cafe name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  city: z.string().min(1, "City is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = demoRequestSchema.parse(body);

    console.log('Demo request received:', parsed);
    console.log('Admin email target:', process.env.ADMIN_EMAIL || 'not configured');

    await sendDemoRequestEmail(parsed);

    return NextResponse.json({ success: true, message: 'Demo request received' });
  } catch (error) {
    console.error('Demo request error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 }
      );
    }
    console.error('Error in demo request:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
