import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/connect";
import Contact from "@/lib/db/models/Contact";
import { sendContactFormEmail } from "@/lib/email/mailer";

const contactSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits").optional(),
  email: z.string().email("Invalid email address"),
  city: z.string().min(2, "City must be at least 2 characters").optional(),
  cafeRestaurantName: z.string().min(2, "Cafe/Restaurant name must be at least 2 characters"),
  needs: z.string().min(10, "Please describe your requirements in at least 10 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('📩 Contact form received:', { ...body, email: body.email });
    
    // Validate request body
    const validatedData = contactSchema.parse(body);

    const contactPayload = {
      fullName: validatedData.fullName,
      contactNumber: validatedData.contactNumber || 'Not provided',
      email: validatedData.email,
      city: validatedData.city || 'Not specified',
      cafeRestaurantName: validatedData.cafeRestaurantName,
      needs: validatedData.needs,
    };

    let contact = null;
    let savedToDatabase = false;
    let emailFailed = false;

    try {
      await connectDB();
      console.log('✅ Database connected');

      contact = await Contact.create({
        ...contactPayload,
        status: 'new',
      });
      savedToDatabase = true;
      console.log('✅ Contact saved to database:', contact._id);
    } catch (dbError: any) {
      console.error('❌ Database save failed, continuing without DB persistence:', dbError);
    }

    try {
      await sendContactFormEmail(contactPayload);
      console.log('✅ Email sent successfully');
    } catch (emailError: any) {
      emailFailed = true;
      console.error('❌ Email sending failed:', emailError);
    }

    if (!savedToDatabase && emailFailed) {
      return NextResponse.json(
        { message: 'Failed to send contact request. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Contact request sent successfully',
        data: {
          id: savedToDatabase ? contact?._id : null,
          status: savedToDatabase ? contact?.status : 'pending',
          savedToDatabase,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Contact form error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to send contact request. Please try again later." },
      { status: 500 }
    );
  }
}