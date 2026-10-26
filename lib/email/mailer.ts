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
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || 'thediningco.contact@gmail.com';
  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
  const pass = rawPass.replace(/\s/g, '');
  const from = process.env.FROM_EMAIL || process.env.SMTP_FROM || 'thediningco.contact@gmail.com';
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
// LUXURY WARM BEIGE & GOLD EMAIL DESIGN SYSTEM
// ============================================

const BRAND_THEME = {
  bgCanvas: '#F8F5EE',       // Warm luxury alabaster canvas
  bgSurface: '#F3EFE6',      // Warm cream surface
  bgCard: '#FFFFFF',         // Crisp card interior
  bgDocket: '#FDFBF7',       // Tinted ivory docket
  bgCallout: '#F8F5EE',      // Warm callout box
  borderLight: '#E5DFD4',    // Warm beige border
  borderDocket: '#EAE3D5',   // Warm docket border
  borderRow: '#F0EAE1',      // Subtle table row separator
  textPrimary: '#1C1917',    // Deep warm espresso charcoal
  textMuted: '#78716C',      // Warm stone muted text
  textLabel: '#8C827A',      // Refined caption label
  accentGold: '#B8860B',     // Rich warm dark gold
  accentGoldHover: '#9C7006',// Deep gold hover
  accentTerracotta: '#8B3A2B',// Warm terracotta for badges/alerts
  headerDark: '#1C1917',     // Deep espresso header
  headerGoldText: '#D4AF37', // Polished gold for logo highlight
  supportPhone: '+91 80854 44188',
  supportEmail: 'thediningco.contact@gmail.com',
  location: 'Bhopal, Madhya Pradesh, India',
};

const emailStyles = `
  <style>
    /* Reset & Base */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1C1917;
      background-color: #F8F5EE;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    a {
      color: #B8860B;
      text-decoration: none;
    }

    .btn-primary:hover {
      background-color: #9C7006 !important;
    }

    .btn-secondary:hover {
      background-color: #EAE3D5 !important;
    }

    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
      }
      .content-cell {
        padding: 24px 18px !important;
      }
      .header-cell {
        padding: 22px 18px !important;
      }
      .footer-cell {
        padding: 20px 18px !important;
      }
      .btn-primary, .btn-secondary {
        display: block !important;
        width: 100% !important;
        margin: 6px 0 !important;
        box-sizing: border-box !important;
      }
    }
  </style>
`;

/**
 * Builds the master outer email shell with The Dining Co.'s Luxury Warm Beige & Gold aesthetic.
 */
function renderLuxuryEmailShell(opts: {
  title: string;
  badge?: string;
  heading: string;
  subheading?: string;
  bodyContent: string;
}): string {
  const { title, badge, heading, subheading, bodyContent } = opts;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  ${emailStyles}
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_THEME.bgCanvas}; font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Outer Canvas Table -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_THEME.bgCanvas}; width: 100%; margin: 0; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Luxury Card -->
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; width: 100%; background-color: ${BRAND_THEME.bgCard}; border: 1px solid ${BRAND_THEME.borderLight}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(28, 25, 23, 0.06);">
          
          <!-- Brand Header -->
          <tr>
            <td class="header-cell" style="background-color: ${BRAND_THEME.headerDark}; padding: 26px 32px 22px; text-align: center; border-bottom: 3px solid ${BRAND_THEME.accentGold};">
              <div style="font-family: 'Plus Jakarta Sans', 'Georgia', serif; font-size: 26px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1.2;">
                The <span style="color: ${BRAND_THEME.headerGoldText};">Dining</span> Co.
              </div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #D6C7B2; margin-top: 5px; font-weight: 500;">
                Premium Digital Menu Management
              </div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="content-cell" style="padding: 32px 32px 26px; background-color: ${BRAND_THEME.bgCard};">
              ${badge ? `
                <div style="margin-bottom: 14px;">
                  <span style="display: inline-block; background-color: ${BRAND_THEME.bgSurface}; color: ${BRAND_THEME.accentTerracotta}; border: 1px solid ${BRAND_THEME.borderLight}; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">
                    ${badge}
                  </span>
                </div>
              ` : ''}

              <h1 style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; color: ${BRAND_THEME.textPrimary}; margin: 0 0 6px 0; letter-spacing: -0.3px; line-height: 1.3;">
                ${heading}
              </h1>

              ${subheading ? `
                <p style="font-size: 14px; line-height: 1.6; color: ${BRAND_THEME.textMuted}; margin: 0 0 20px 0;">
                  ${subheading}
                </p>
              ` : ''}

              ${bodyContent}
            </td>
          </tr>

          <!-- Brand Footer -->
          <tr>
            <td class="footer-cell" style="background-color: ${BRAND_THEME.bgSurface}; padding: 22px 32px; text-align: center; border-top: 1px solid ${BRAND_THEME.borderLight};">
              <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 700; color: ${BRAND_THEME.textPrimary}; font-size: 13px; margin-bottom: 3px;">
                The Dining Co.
              </div>
              <div style="font-size: 12px; color: ${BRAND_THEME.textMuted}; margin-bottom: 10px;">
                ${BRAND_THEME.location}
              </div>
              <div style="font-size: 12px; color: ${BRAND_THEME.textMuted};">
                <a href="tel:+918085444188" style="color: ${BRAND_THEME.accentGold}; text-decoration: none; font-weight: 600;">${BRAND_THEME.supportPhone}</a>
                &nbsp;&nbsp;•&nbsp;&nbsp;
                <a href="mailto:${BRAND_THEME.supportEmail}" style="color: ${BRAND_THEME.accentGold}; text-decoration: none; font-weight: 600;">${BRAND_THEME.supportEmail}</a>
              </div>
              <div style="font-size: 11px; color: #A8A29E; margin-top: 12px;">
                © ${year} The Dining Co. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Helper to build an elegant docket row.
 */
function renderDocketRow(label: string, valueHtml: string, isLast = false): string {
  return `
    <tr>
      <td style="padding: 11px 16px; ${isLast ? '' : `border-bottom: 1px solid ${BRAND_THEME.borderRow};`}">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: ${BRAND_THEME.textLabel}; margin-bottom: 3px;">
          ${label}
        </div>
        <div style="font-size: 15px; font-weight: 600; color: ${BRAND_THEME.textPrimary}; word-break: break-word; line-height: 1.4;">
          ${valueHtml}
        </div>
      </td>
    </tr>
  `;
}

/**
 * Helper to build a luxury docket container.
 */
function renderDocket(rowsHtml: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_THEME.bgDocket}; border: 1px solid ${BRAND_THEME.borderDocket}; border-radius: 12px; margin: 0 0 18px 0; overflow: hidden;">
      ${rowsHtml}
    </table>
  `;
}

/**
 * Helper to build a highlighted message box.
 */
function renderMessageBox(title: string, message: string): string {
  return `
    <div style="background-color: ${BRAND_THEME.bgCallout}; border: 1px solid ${BRAND_THEME.borderDocket}; border-left: 4px solid ${BRAND_THEME.accentGold}; border-radius: 8px; padding: 14px 16px; margin: 0 0 20px 0;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_THEME.accentGold}; margin-bottom: 6px;">
        ${title}
      </div>
      <div style="font-size: 14px; line-height: 1.6; color: ${BRAND_THEME.textPrimary}; white-space: pre-wrap;">${message}</div>
    </div>
  `;
}

/**
 * Helper to build CTA action buttons.
 */
function renderButtons(buttons: { label: string; href: string; primary?: boolean }[]): string {
  const rendered = buttons.map(b => {
    if (b.primary) {
      return `<a href="${b.href}" class="btn-primary" style="display: inline-block; background-color: ${BRAND_THEME.accentGold}; color: #FFFFFF !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 24px; border-radius: 8px; margin: 4px 6px; box-shadow: 0 2px 8px rgba(184, 134, 11, 0.22); text-align: center;">${b.label}</a>`;
    }
    return `<a href="${b.href}" class="btn-secondary" style="display: inline-block; background-color: ${BRAND_THEME.bgSurface}; color: ${BRAND_THEME.textPrimary} !important; border: 1px solid ${BRAND_THEME.borderLight}; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 8px; margin: 4px 6px; text-align: center;">${b.label}</a>`;
  }).join('');

  return `
    <div style="text-align: center; margin: 22px 0 10px 0;">
      ${rendered}
    </div>
  `;
}

// ============================================
// EMAIL TEMPLATES IMPLEMENTATION
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

  const docketHtml = renderDocket(`
    ${renderDocketRow('Restaurant / Cafe', cafeName)}
    ${renderDocketRow('Owner / Contact Person', ownerName)}
    ${renderDocketRow('Phone Number', `<a href="tel:${contactNumber}" style="color: ${BRAND_THEME.textPrimary}; text-decoration: none; font-weight: 600;">📞 ${contactNumber || 'Not provided'}</a>`)}
    ${renderDocketRow('Email Address', `<a href="mailto:${email}" style="color: ${BRAND_THEME.accentGold}; text-decoration: underline; font-weight: 600;">✉️ ${email}</a>`)}
    ${renderDocketRow('Location', `📍 ${city || 'Not specified'}${location ? `, ${location}` : ''}`)}
    ${renderDocketRow('Preferred Start Date', `🗓️ ${formattedDate}`, true)}
  `);

  const actionsHtml = renderButtons([
    { label: `✉️ Reply to ${ownerName}`, href: `mailto:${email}?subject=The%20Dining%20Co.%20Demo%20Request%20-%20${encodeURIComponent(cafeName)}`, primary: true },
    ...(contactNumber ? [{ label: `📞 Call Owner`, href: `tel:${contactNumber}`, primary: false }] : []),
  ]);

  const html = renderLuxuryEmailShell({
    title: 'New Demo Request',
    badge: '✦ NEW DEMO REQUEST',
    heading: 'New Demo Request Received',
    subheading: 'A restaurant owner has requested a live demonstration and onboarding for their business.',
    bodyContent: `${docketHtml}${actionsHtml}`,
  });

  const text = `
NEW DEMO REQUEST - THE DINING CO.

Restaurant: ${cafeName}
Owner: ${ownerName}
Phone: ${contactNumber || 'Not provided'}
Email: ${email}
Location: ${city}, ${location}
Start Date: ${formattedDate}

Reply to: ${email}
Direct Phone: ${contactNumber}

© ${new Date().getFullYear()} The Dining Co. • Bhopal, India
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
    console.log('✅ Demo request email sent to admin');
    
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
    : 'Flexible';

  const docketHtml = renderDocket(`
    ${renderDocketRow('Restaurant', cafeName)}
    ${renderDocketRow('Scheduled Onboarding Window', formattedDate, true)}
  `);

  const calloutHtml = renderMessageBox(
    'WHAT HAPPENS NEXT?',
    'Our dining solutions specialist from Bhopal will contact you within 24 hours to schedule your personalized live demo, walk you through the digital menu workflow, and answer any questions.'
  );

  const actionsHtml = renderButtons([
    { label: 'Explore Features Online', href: 'https://thediningco.com', primary: true },
    { label: `📞 Call Us: ${BRAND_THEME.supportPhone}`, href: `tel:+918085444188`, primary: false },
  ]);

  const html = renderLuxuryEmailShell({
    title: 'Demo Request Received',
    badge: '✦ DEMO CONFIRMATION',
    heading: `Thank you, ${ownerName}!`,
    subheading: `We've successfully received your demo request for <strong>${cafeName}</strong>. We're excited to partner with you.`,
    bodyContent: `${docketHtml}${calloutHtml}${actionsHtml}`,
  });

  const text = `
Thank you, ${ownerName}!

We've received your demo request for ${cafeName}.
Our team in Bhopal will contact you within 24 hours.

Restaurant: ${cafeName}
Start Date: ${formattedDate}

Need immediate assistance?
Call +91 80854 44188 or email thediningco.contact@gmail.com.

© ${new Date().getFullYear()} The Dining Co. • Bhopal, India
  `;

  try {
    await transporter.sendMail({
      from: `"The Dining Co." <${getMailerConfig().from}>`,
      to: email,
      subject,
      html,
      text,
    });
    console.log('✅ Demo confirmation email sent to customer');
  } catch (error) {
    console.error('❌ Failed to send demo confirmation email:', error);
  }
}

// ===== 3. CONTACT FORM EMAIL (Admin & Customer Confirmation) =====
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
  const subject = `New Contact - ${fullName}${cafeRestaurantName ? ` (${cafeRestaurantName})` : ''}`;

  // Docket for Admin Notification
  const docketHtml = renderDocket(`
    ${renderDocketRow('Full Name', fullName)}
    ${renderDocketRow('Cafe / Restaurant', cafeRestaurantName || 'Not specified')}
    ${renderDocketRow('Contact Number', `<a href="tel:${contactNumber}" style="color: ${BRAND_THEME.textPrimary}; text-decoration: none; font-weight: 600;">📞 ${contactNumber || 'Not provided'}</a>`)}
    ${renderDocketRow('Email Address', `<a href="mailto:${email}" style="color: ${BRAND_THEME.accentGold}; text-decoration: underline; font-weight: 600;">✉️ ${email}</a>`)}
    ${renderDocketRow('City / Location', `📍 ${city || 'Not specified'}`, true)}
  `);

  const messageBoxHtml = renderMessageBox('INQUIRY MESSAGE / REQUIREMENTS', needs || 'No additional details provided.');

  const actionsHtml = renderButtons([
    { label: `✉️ Reply to ${fullName}`, href: `mailto:${email}?subject=Re:%20The%20Dining%20Co.%20Inquiry%20-%20${encodeURIComponent(cafeRestaurantName || fullName)}`, primary: true },
    ...(contactNumber ? [{ label: `📞 Call ${fullName.split(' ')[0]}`, href: `tel:${contactNumber}`, primary: false }] : []),
  ]);

  const html = renderLuxuryEmailShell({
    title: 'New Contact Inquiry',
    badge: '✦ NEW CONTACT INQUIRY',
    heading: 'New Contact Inquiry Received',
    subheading: 'A new prospective client has reached out through your website contact form.',
    bodyContent: `${docketHtml}${messageBoxHtml}${actionsHtml}`,
  });

  const text = `
NEW CONTACT INQUIRY - THE DINING CO.

Name: ${fullName}
Restaurant: ${cafeRestaurantName || 'Not specified'}
Contact Number: ${contactNumber || 'Not provided'}
Email: ${email}
City: ${city || 'Not specified'}

Message / Requirements:
${needs}

Reply to: ${email}
Phone: ${contactNumber}

© ${new Date().getFullYear()} The Dining Co. • Bhopal, India
  `;

  try {
    const adminTarget = process.env.ADMIN_EMAIL || 'thediningco.contact@gmail.com';
    await transporter.sendMail({
      from: `"The Dining Co." <${getMailerConfig().from}>`,
      to: adminTarget,
      subject,
      html,
      text,
      replyTo: email,
    });
    console.log('✅ Contact form email sent to admin:', adminTarget);

    // Also send an automated luxury confirmation receipt to the customer
    if (email && email.toLowerCase() !== adminTarget.toLowerCase()) {
      try {
        const customerDocketHtml = renderDocket(`
          ${renderDocketRow('Your Name', fullName)}
          ${renderDocketRow('Restaurant', cafeRestaurantName || 'Not specified')}
          ${renderDocketRow('Contact Number', contactNumber || 'Not provided')}
          ${renderDocketRow('Submitted Requirements', needs || 'General Inquiry', true)}
        `);

        const customerCalloutHtml = renderMessageBox(
          'WE ARE REVIEWING YOUR REQUEST',
          `Thank you for reaching out! Our team in Bhopal will review your requirements and get in touch with you at <strong>${contactNumber || email}</strong> within <strong>24 hours</strong>.`
        );

        const customerActionsHtml = renderButtons([
          { label: `📞 Call Us: ${BRAND_THEME.supportPhone}`, href: `tel:+918085444188`, primary: true },
          { label: 'Visit Website', href: 'https://thediningco.com', primary: false },
        ]);

        const customerHtml = renderLuxuryEmailShell({
          title: 'We Received Your Inquiry',
          badge: '✦ INQUIRY CONFIRMATION',
          heading: `Thank you, ${fullName}!`,
          subheading: `We've received your inquiry regarding <strong>${cafeRestaurantName || 'your restaurant'}</strong>.`,
          bodyContent: `${customerDocketHtml}${customerCalloutHtml}${customerActionsHtml}`,
        });

        const customerText = `
Thank you, ${fullName}!

We've received your inquiry regarding ${cafeRestaurantName || 'your restaurant'}.
Our team will review your requirements and reach out to you within 24 hours.

Submitted Details:
Restaurant: ${cafeRestaurantName || 'Not specified'}
Contact: ${contactNumber || 'Not provided'}
Requirements: ${needs}

Need immediate assistance?
Call +91 80854 44188 or email thediningco.contact@gmail.com.

© ${new Date().getFullYear()} The Dining Co. • Bhopal, India
        `;

        await transporter.sendMail({
          from: `"The Dining Co." <${getMailerConfig().from}>`,
          to: email,
          subject: `We've Received Your Inquiry - The Dining Co.`,
          html: customerHtml,
          text: customerText,
        });
        console.log('✅ Confirmation email sent to customer:', email);
      } catch (custErr) {
        console.warn('⚠️ Could not send customer confirmation email (continuing):', custErr);
      }
    }
  } catch (error) {
    console.error('❌ Failed to send contact form email:', error);
    throw error;
  }
}

// ===== 4. PASSWORD OTP EMAIL =====
export async function sendPasswordOtpEmail(opts: { to: string; cafeName: string; otp: string }) {
  const { to, cafeName, otp } = opts;
  const transporter = createTransport();
  const subject = `Password Reset Verification Code - The Dining Co.`;

  const codeBoxHtml = `
    <div style="background-color: ${BRAND_THEME.bgDocket}; border: 2px dashed ${BRAND_THEME.accentGold}; border-radius: 12px; padding: 24px 16px; text-align: center; margin: 18px 0;">
      <div style="font-size: 11px; color: ${BRAND_THEME.textLabel}; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
        One-Time Verification Code
      </div>
      <div style="font-size: 40px; font-weight: 800; letter-spacing: 8px; color: ${BRAND_THEME.textPrimary}; font-family: 'SF Mono', 'Courier New', monospace; margin: 10px 0;">
        ${otp}
      </div>
      <div style="font-size: 13px; color: ${BRAND_THEME.textMuted}; font-weight: 500;">
        ⏰ Valid for the next 10 minutes
      </div>
    </div>
  `;

  const warningBoxHtml = `
    <div style="background-color: #FDF4F3; border: 1px solid #F5D5D0; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
      <div style="font-size: 13px; color: ${BRAND_THEME.accentTerracotta}; font-weight: 700; margin-bottom: 2px;">
        ⚠️ Didn't request this code?
      </div>
      <div style="font-size: 13px; color: ${BRAND_THEME.textMuted}; line-height: 1.5;">
        If you did not request a password reset, you can safely disregard this email. Your account credentials remain secure.
      </div>
    </div>
  `;

  const html = renderLuxuryEmailShell({
    title: 'Password Reset',
    badge: '✦ SECURITY VERIFICATION',
    heading: 'Reset Your Account Password',
    subheading: `A password reset request was initiated for your <strong>${cafeName}</strong> account. Please use the verification code below to complete the process.`,
    bodyContent: `${codeBoxHtml}${warningBoxHtml}`,
  });

  const text = `
PASSWORD RESET - THE DINING CO.

We received a request to reset the password for ${cafeName}.

Your verification code is: ${otp}

⏰ This code expires in 10 minutes.
⚠️ If you didn't request this, you can safely ignore this email.

© ${new Date().getFullYear()} The Dining Co. • Bhopal, India
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
  const subject = `Password Changed Successfully - The Dining Co.`;

  const successBoxHtml = `
    <div style="background-color: #F3FBF5; border: 1px solid #C8ECD2; border-radius: 8px; padding: 14px 16px; margin: 16px 0;">
      <div style="color: #166534; font-weight: 700; font-size: 14px; margin-bottom: 2px;">
        ✅ Password Changed Successfully
      </div>
      <div style="color: #15803d; font-size: 13px; line-height: 1.5;">
        Your password has been updated. If you made this change, no further action is needed.
      </div>
    </div>
  `;

  const warningBoxHtml = `
    <div style="background-color: #FDF4F3; border: 1px solid #F5D5D0; border-radius: 8px; padding: 14px 16px; margin: 16px 0;">
      <div style="color: ${BRAND_THEME.accentTerracotta}; font-weight: 700; font-size: 14px; margin-bottom: 2px;">
        ⚠️ Didn't make this change?
      </div>
      <div style="color: ${BRAND_THEME.textMuted}; font-size: 13px; line-height: 1.5;">
        Please contact our support team immediately at <a href="mailto:${BRAND_THEME.supportEmail}" style="color: ${BRAND_THEME.accentGold}; font-weight: 600;">${BRAND_THEME.supportEmail}</a> or call <a href="tel:+918085444188" style="color: ${BRAND_THEME.accentGold}; font-weight: 600;">${BRAND_THEME.supportPhone}</a>.
      </div>
    </div>
  `;

  const html = renderLuxuryEmailShell({
    title: 'Password Changed',
    badge: '✦ SECURITY NOTICE',
    heading: 'Password Successfully Updated',
    subheading: `The password for <strong>${cafeName}${username ? ` (${username})` : ''}</strong> was just changed.`,
    bodyContent: `${successBoxHtml}${warningBoxHtml}`,
  });

  const text = `
PASSWORD CHANGE CONFIRMATION - THE DINING CO.

The password for ${cafeName}${username ? ` (${username})` : ''} was changed successfully.

✅ If you made this change, no further action is needed.
⚠️ If you did NOT make this change, please contact support immediately at thediningco.contact@gmail.com or +91 80854 44188.

© ${new Date().getFullYear()} The Dining Co. • Bhopal, India
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
  const subject = `Welcome to The Dining Co. – ${cafeName} is Live!`;

  const linksDocketHtml = renderDocket(`
    ${renderDocketRow('Live Public Menu', `<a href="${menuUrl}" target="_blank" style="color: ${BRAND_THEME.accentGold}; text-decoration: underline; font-weight: 600;">${menuUrl}</a>`)}
    ${renderDocketRow('Admin Portal', `<a href="${adminUrl}" target="_blank" style="color: ${BRAND_THEME.textPrimary}; text-decoration: none; font-weight: 600;">${adminUrl}</a>`, true)}
  `);

  const credentialsBoxHtml = username && password ? `
    <div style="background-color: ${BRAND_THEME.bgSurface}; border-radius: 10px; padding: 16px; margin: 18px 0; border: 1px solid ${BRAND_THEME.borderLight};">
      <div style="font-size: 11px; color: ${BRAND_THEME.textLabel}; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 10px; text-align: center;">
        Your Login Credentials
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="48%" style="background-color: #FFFFFF; border: 1px solid ${BRAND_THEME.borderLight}; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 10px; color: ${BRAND_THEME.textLabel}; text-transform: uppercase; font-weight: 600;">Username</div>
            <div style="font-size: 15px; font-weight: 700; color: ${BRAND_THEME.textPrimary}; margin-top: 3px;">${username}</div>
          </td>
          <td width="4%"></td>
          <td width="48%" style="background-color: #FFFFFF; border: 1px solid ${BRAND_THEME.borderLight}; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 10px; color: ${BRAND_THEME.textLabel}; text-transform: uppercase; font-weight: 600;">Password</div>
            <div style="font-size: 15px; font-weight: 700; color: ${BRAND_THEME.textPrimary}; margin-top: 3px;">••••••••</div>
          </td>
        </tr>
      </table>
    </div>
  ` : '';

  const actionsHtml = renderButtons([
    { label: '🚀 Open Admin Dashboard', href: adminUrl, primary: true },
    { label: '🍽️ View Live Menu', href: menuUrl, primary: false },
  ]);

  const html = renderLuxuryEmailShell({
    title: 'Welcome to The Dining Co.',
    badge: '✦ WELCOME ABOARD',
    heading: `Welcome to The Dining Co., ${cafeName}!`,
    subheading: `Hello${ownerName ? ` ${ownerName}` : ''}! Your restaurant is officially live on The Dining Co. platform. You can manage your digital menu, tables, and settings directly from your admin dashboard.`,
    bodyContent: `${linksDocketHtml}${credentialsBoxHtml}${actionsHtml}`,
  });

  const text = `
WELCOME TO THE DINING CO.

Hello${ownerName ? ` ${ownerName}` : ''}!
${cafeName} is officially live on The Dining Co. platform.

Public Menu: ${menuUrl}
Admin Dashboard: ${adminUrl}

${username && password ? `
Admin Credentials:
Username: ${username}
Password: [saved securely]
` : ''}

Log in to your dashboard: ${adminUrl}

Need support? Reach our Bhopal team at +91 80854 44188 or thediningco.contact@gmail.com.

© ${new Date().getFullYear()} The Dining Co. • Bhopal, India
  `;

  try {
    await transporter.sendMail({
      from: `"The Dining Co." <${getMailerConfig().from}>`,
      to,
      subject,
      html,
      text,
    });
    console.log('✅ Cafe welcome email sent to:', to);
  } catch (error) {
    console.error('❌ Failed to send cafe welcome email:', error);
    throw error;
  }
}