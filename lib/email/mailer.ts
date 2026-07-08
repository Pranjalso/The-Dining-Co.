import nodemailer from 'nodemailer';

export type MailerConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export function getMailerConfig(): MailerConfig {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || 'pranjalsoni484@gmail.com';
  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
  const pass = rawPass.replace(/\s/g, '');
  const from = process.env.FROM_EMAIL || process.env.SMTP_FROM || 'pranjalsoni484@gmail.com';
  const secure = port === 465;
  
  console.log('📧 Mailer Config:', {
    host,
    port,
    secure,
    user,
    from,
    hasPassword: !!pass,
    passwordLength: pass?.length || 0,
  });
  
  if (!host || !user || !pass || !from) {
    const missing = [];
    if (!host) missing.push('SMTP_HOST');
    if (!user) missing.push('SMTP_USER');
    if (!pass) missing.push('SMTP_PASS');
    if (!from) missing.push('FROM_EMAIL');
    throw new Error(`SMTP configuration is incomplete. Missing: ${missing.join(', ')}`);
  }
  
  return { host, port, secure, user, pass, from };
}

export function createTransport() {
  const cfg = getMailerConfig();
  
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { 
      user: cfg.user, 
      pass: cfg.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 10,
  });
}

// ============================================
// SIMPLE & CLEAN EMAIL STYLES
// ============================================
const emailStyles = `
  <style>
    /* Reset & Base */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
    }
    
    /* ===== HEADER ===== */
    .header {
      background: #0F172A;
      padding: 24px 32px;
      text-align: center;
      border-bottom: 3px solid #D4AF37;
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
      margin: 0;
    }
    
    .header h1 span {
      color: #D4AF37;
    }
    
    .header-subtitle {
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      margin-top: 2px;
      font-weight: 400;
    }
    
    /* ===== CONTENT ===== */
    .content {
      padding: 28px 32px 24px;
    }
    
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #0F172A;
      margin-bottom: 4px;
    }
    
    .message {
      color: #64748B;
      font-size: 14px;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    
    /* ===== DIVIDER ===== */
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 16px 0;
    }
    
    /* ===== FIELD ===== */
    .field {
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    
    .field:last-child {
      border-bottom: none;
    }
    
    .field-label {
      font-size: 11px;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    .field-value {
      font-size: 15px;
      color: #0F172A;
      font-weight: 500;
      margin-top: 2px;
      word-break: break-word;
    }
    
    .field-value a {
      color: #D4AF37;
      text-decoration: none;
    }
    
    .field-value a:hover {
      text-decoration: underline;
    }
    
    /* ===== MESSAGE BOX ===== */
    .message-box {
      background: #f8fafc;
      border-radius: 8px;
      padding: 14px 16px;
      margin-top: 6px;
      border: 1px solid #e2e8f0;
    }
    
    .message-box .field-value {
      font-weight: 400;
      white-space: pre-wrap;
    }
    
    /* ===== BUTTON ===== */
    .btn-container {
      text-align: center;
      margin: 20px 0 4px;
    }
    
    .btn-primary {
      display: inline-block;
      background: #D4AF37;
      color: #0F172A !important;
      padding: 10px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
    }
    
    .btn-primary:hover {
      background: #c49e2f;
    }
    
    /* ===== FOOTER ===== */
    .footer {
      background: #f8fafc;
      padding: 16px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer-text {
      font-size: 12px;
      color: #94A3B8;
    }
    
    /* ===== RESPONSIVE ===== */
    @media (max-width: 600px) {
      .content {
        padding: 20px;
      }
      
      .header {
        padding: 20px;
      }
      
      .header h1 {
        font-size: 20px;
      }
      
      .footer {
        padding: 14px 20px;
      }
      
      .btn-primary {
        display: block;
        width: 100%;
        text-align: center;
      }
    }
  </style>
`;

// ============================================
// SIMPLIFIED EMAIL TEMPLATES
// ============================================

// ===== 1. DEMO REQUEST EMAIL (Admin) =====
export async function sendDemoRequestEmail(opts: {
  cafeName: string;
  ownerName: string;
  email: string;
  city: string;
  location: string;
  startDate: string;
  contactNumber: string;
}) {
  const { cafeName, ownerName, email, city, location, startDate, contactNumber } = opts;
  const transporter = createTransport();
  const subject = `New Demo Request - ${cafeName}`;

  const formattedDate = startDate 
    ? new Date(startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not specified';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Demo Request</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>The <span>Dining</span> Co.</h1>
          <div class="header-subtitle">Premium Digital Menu Management</div>
        </div>
        
        <div class="content">
          <div class="greeting">New Demo Request</div>
          <div class="message">A new demo request has been submitted.</div>
          
          <div class="field">
            <div class="field-label">Restaurant</div>
            <div class="field-value">${cafeName}</div>
          </div>
          <div class="field">
            <div class="field-label">Owner</div>
            <div class="field-value">${ownerName}</div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value"><a href="mailto:${email}">${email}</a></div>
          </div>
          <div class="field">
            <div class="field-label">Contact</div>
            <div class="field-value">${contactNumber}</div>
          </div>
          <div class="field">
            <div class="field-label">Location</div>
            <div class="field-value">${city}, ${location}</div>
          </div>
          <div class="field" style="border-bottom: none;">
            <div class="field-label">Start Date</div>
            <div class="field-value">${formattedDate}</div>
          </div>
          
          <div class="btn-container">
            <a href="mailto:${email}" class="btn-primary">Reply to ${ownerName}</a>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">© ${new Date().getFullYear()} The Dining Co.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
NEW DEMO REQUEST

Restaurant: ${cafeName}
Owner: ${ownerName}
Email: ${email}
Contact: ${contactNumber}
Location: ${city}, ${location}
Start Date: ${formattedDate}

Reply to: ${email}

© ${new Date().getFullYear()} The Dining Co.
  `;

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"The Dining Co." <${getMailerConfig().from}>`,
      to: process.env.ADMIN_EMAIL || getMailerConfig().from,
      subject,
      html,
      text,
      replyTo: email,
    });
    console.log('✅ Demo request email sent');
    
    await sendDemoConfirmationEmail(opts);
  } catch (error) {
    console.error('❌ Failed to send demo request email:', error);
    throw error;
  }
}

// ===== 2. DEMO CONFIRMATION EMAIL (Customer) =====
export async function sendDemoConfirmationEmail(opts: {
  cafeName: string;
  ownerName: string;
  email: string;
  startDate: string;
}) {
  const { cafeName, ownerName, email, startDate } = opts;
  const transporter = createTransport();
  const subject = `Demo Request Received - The Dining Co.`;

  const formattedDate = startDate 
    ? new Date(startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not specified';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Demo Confirmation</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>The <span>Dining</span> Co.</h1>
          <div class="header-subtitle">Premium Digital Menu Management</div>
        </div>
        
        <div class="content">
          <div class="greeting">Thank you, ${ownerName}!</div>
          <div class="message">
            We've received your demo request for <strong>${cafeName}</strong>.
            Our team will contact you within <strong>24 hours</strong>.
          </div>
          
          <div class="field">
            <div class="field-label">Restaurant</div>
            <div class="field-value">${cafeName}</div>
          </div>
          <div class="field" style="border-bottom: none;">
            <div class="field-label">Start Date</div>
            <div class="field-value">${formattedDate}</div>
          </div>
          
          <div class="divider"></div>
          
          <div style="text-align: center; color: #94A3B8; font-size: 13px;">
            <p>Explore our features at <a href="https://thediningco.com" style="color: #D4AF37;">thediningco.com</a></p>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">© ${new Date().getFullYear()} The Dining Co.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Thank you, ${ownerName}!

We've received your demo request for ${cafeName}.
Our team will contact you within 24 hours.

Restaurant: ${cafeName}
Start Date: ${formattedDate}

Explore our features: thediningco.com

© ${new Date().getFullYear()} The Dining Co.
  `;

  try {
    await transporter.sendMail({
      from: `"The Dining Co." <${getMailerConfig().from}>`,
      to: email,
      subject,
      html,
      text,
    });
    console.log('✅ Demo confirmation email sent');
  } catch (error) {
    console.error('❌ Failed to send demo confirmation email:', error);
  }
}

// ===== 3. CONTACT FORM EMAIL (Admin) - SIMPLIFIED =====
export async function sendContactFormEmail(opts: {
  fullName: string;
  contactNumber: string;
  email: string;
  city: string;
  cafeRestaurantName: string;
  needs: string;
}) {
  const { fullName, contactNumber, email, city, cafeRestaurantName, needs } = opts;
  const transporter = createTransport();
  const subject = `New Contact - ${fullName} from ${cafeRestaurantName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>The <span>Dining</span> Co.</h1>
          <div class="header-subtitle">Premium Digital Menu Management</div>
        </div>
        
        <div class="content">
          <div class="greeting">New Contact Inquiry</div>
          <div class="message">A new message has been submitted through the contact form.</div>
          
          <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">${fullName}</div>
          </div>
          <div class="field">
            <div class="field-label">Restaurant</div>
            <div class="field-value">${cafeRestaurantName}</div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value"><a href="mailto:${email}">${email}</a></div>
          </div>
          <div class="field" style="border-bottom: none; padding-bottom: 0;">
            <div class="field-label">Message</div>
            <div class="message-box">
              <div class="field-value">${needs}</div>
            </div>
          </div>
          
          <div class="btn-container">
            <a href="mailto:${email}" class="btn-primary">Reply to ${fullName}</a>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">© ${new Date().getFullYear()} The Dining Co.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
NEW CONTACT INQUIRY

Name: ${fullName}
Restaurant: ${cafeRestaurantName}
Email: ${email}

Message:
${needs}

Reply to: ${email}

© ${new Date().getFullYear()} The Dining Co.
  `;

  try {
    await transporter.sendMail({
      from: `"The Dining Co." <${getMailerConfig().from}>`,
      to: process.env.ADMIN_EMAIL || getMailerConfig().from,
      subject,
      html,
      text,
      replyTo: email,
    });
    console.log('✅ Contact form email sent');
  } catch (error) {
    console.error('❌ Failed to send contact form email:', error);
    throw error;
  }
}

// ===== 4. PASSWORD OTP EMAIL =====
export async function sendPasswordOtpEmail(opts: { to: string; cafeName: string; otp: string }) {
  const { to, cafeName, otp } = opts;
  const transporter = createTransport();
  const subject = `Password Reset - The Dining Co.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>The <span>Dining</span> Co.</h1>
          <div class="header-subtitle">Premium Digital Menu Management</div>
        </div>
        
        <div class="content">
          <div class="greeting">Password Reset</div>
          <div class="message">
            We received a request to reset the password for <strong>${cafeName}</strong>.
            Use the code below to complete the process.
          </div>
          
          <div style="background: #f8fafc; border: 2px dashed #D4AF37; border-radius: 10px; padding: 24px; text-align: center; margin: 16px 0;">
            <div style="font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Verification Code</div>
            <div style="font-size: 38px; font-weight: 700; letter-spacing: 8px; color: #0F172A; font-family: 'SF Mono', monospace; margin: 6px 0;">${otp}</div>
            <div style="font-size: 13px; color: #94A3B8;">⏰ Expires in 10 minutes</div>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin: 12px 0;">
            <div style="font-size: 13px; color: #991b1b; font-weight: 600;">⚠️ Didn't request this?</div>
            <div style="font-size: 13px; color: #b91c1c;">You can safely ignore this email. Your account remains secure.</div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">© ${new Date().getFullYear()} The Dining Co.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
PASSWORD RESET

We received a request to reset the password for ${cafeName}.

Your verification code is: ${otp}

⏰ This code expires in 10 minutes.

⚠️ If you didn't request this, please ignore this email.

© ${new Date().getFullYear()} The Dining Co.
  `;

  try {
    await transporter.sendMail({
      from: `"The Dining Co." <${getMailerConfig().from}>`,
      to,
      subject,
      html,
      text,
    });
    console.log('✅ Password OTP email sent');
  } catch (error) {
    console.error('❌ Failed to send password OTP email:', error);
    throw error;
  }
}

// ===== 5. PASSWORD RESET CONFIRMATION EMAIL =====
export async function sendPasswordResetConfirmationEmail(opts: { to: string; cafeName: string; username?: string }) {
  const { to, cafeName, username } = opts;
  const transporter = createTransport();
  const subject = `Password Changed - The Dining Co.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>The <span>Dining</span> Co.</h1>
          <div class="header-subtitle">Premium Digital Menu Management</div>
        </div>
        
        <div class="content">
          <div class="greeting">Password Updated</div>
          <div class="message">
            The password for <strong>${cafeName}${username ? ` (${username})` : ''}</strong>
            was changed successfully.
          </div>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin: 12px 0;">
            <div style="color: #166534; font-weight: 600; font-size: 14px;">✅ Password Changed</div>
            <div style="color: #15803d; font-size: 13px;">If you made this change, no further action is needed.</div>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin: 12px 0;">
            <div style="color: #991b1b; font-weight: 600; font-size: 14px;">⚠️ Didn't make this change?</div>
            <div style="color: #b91c1c; font-size: 13px;">Please contact support immediately.</div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">© ${new Date().getFullYear()} The Dining Co.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
PASSWORD CHANGE CONFIRMATION

The password for ${cafeName}${username ? ` (${username})` : ''} was changed successfully.

✅ If you made this change, no further action is needed.

⚠️ If you did NOT make this change, contact support immediately.

© ${new Date().getFullYear()} The Dining Co.
  `;

  try {
    await transporter.sendMail({
      from: `"The Dining Co." <${getMailerConfig().from}>`,
      to,
      subject,
      html,
      text,
    });
    console.log('✅ Password reset confirmation email sent');
  } catch (error) {
    console.error('❌ Failed to send password reset confirmation email:', error);
    throw error;
  }
}

// ===== 6. WELCOME EMAIL (New Cafe) =====
export async function sendCafeWelcomeEmail(opts: {
  to: string;
  cafeName: string;
  ownerName?: string;
  menuUrl: string;
  adminUrl: string;
  username?: string;
  password?: string;
}) {
  const { to, cafeName, ownerName, menuUrl, adminUrl, username, password } = opts;
  const transporter = createTransport();
  const subject = `Welcome to The Dining Co. – ${cafeName} is now live!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>The <span>Dining</span> Co.</h1>
          <div class="header-subtitle">Premium Digital Menu Management</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello${ownerName ? `, ${ownerName}` : ''}!</div>
          <div class="message">
            <strong>${cafeName}</strong> is now live on The Dining Co. platform.
          </div>
          
          <div class="field">
            <div class="field-label">Public Menu</div>
            <div class="field-value"><a href="${menuUrl}" target="_blank">${menuUrl}</a></div>
          </div>
          <div class="field" style="border-bottom: none;">
            <div class="field-label">Admin Dashboard</div>
            <div class="field-value"><a href="${adminUrl}" target="_blank">${adminUrl}</a></div>
          </div>
          
          ${username && password ? `
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 8px;">Admin Credentials</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
                  <div style="font-size: 10px; color: #94A3B8; text-transform: uppercase;">Username</div>
                  <div style="font-size: 14px; font-weight: 600; color: #0F172A;">${username}</div>
                </div>
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
                  <div style="font-size: 10px; color: #94A3B8; text-transform: uppercase;">Password</div>
                  <div style="font-size: 14px; font-weight: 600; color: #0F172A;">••••••••</div>
                </div>
              </div>
            </div>
          ` : ''}
          
          <div class="btn-container">
            <a href="${adminUrl}" class="btn-primary" target="_blank">Go to Dashboard</a>
          </div>
          
          <div class="divider"></div>
          
          <div style="text-align: center; color: #94A3B8; font-size: 13px;">
            <p>Need help? <a href="mailto:support@thediningco.com" style="color: #D4AF37;">support@thediningco.com</a></p>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">© ${new Date().getFullYear()} The Dining Co.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
WELCOME TO THE DINING CO.

Hello${ownerName ? `, ${ownerName}` : ''}!

${cafeName} is now live on The Dining Co. platform.

Public Menu: ${menuUrl}
Admin Dashboard: ${adminUrl}

${username && password ? `
Admin Credentials:
Username: ${username}
Password: [saved securely]
` : ''}

Go to Dashboard: ${adminUrl}

Need help? support@thediningco.com

© ${new Date().getFullYear()} The Dining Co.
  `;

  try {
    await transporter.sendMail({
      from: `"The Dining Co." <${getMailerConfig().from}>`,
      to,
      subject,
      html,
      text,
    });
    console.log('✅ Cafe welcome email sent');
  } catch (error) {
    console.error('❌ Failed to send cafe welcome email:', error);
    throw error;
  }
}