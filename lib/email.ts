// import nodemailer from 'nodemailer'; // Future email implementation
import { generateAllCalendarLinks } from './calendar';

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  dogName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  invoiceUrl?: string;
  paymentMethod: string;
  ghlSuccess: boolean;
  xeroSuccess: boolean;
  bookingId?: string | number;
}

export async function sendBookingConfirmation(bookingData: BookingEmailData) {
  try {
    // Generate calendar links
    const calendarLinks = generateAllCalendarLinks({
      dogName: bookingData.dogName,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      checkIn: new Date(bookingData.checkIn),
      checkOut: new Date(bookingData.checkOut),
      totalPrice: bookingData.totalPrice,
      bookingId: bookingData.bookingId,
    });

    // Create branded HTML email template
    const emailHtml = `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="x-apple-disable-message-reformatting" />
          <meta content="width=device-width, initial-scale=1.0" name="viewport" />
          <title>Booking Confirmation - 100% K9</title>
        </head>
        <body style="background-color:#f6f6f6; margin:0; padding:40px 0; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;">
          <!-- Preheader (hidden) -->
          <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
            Your dog boarding booking with 100% K9 has been confirmed — check your booking details inside.
          </div>

          <!-- Container -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden;">
            <tr>
              <td style="padding:0;">

                <!-- Header Image -->
                <img src="https://storage.googleapis.com/msgsndr/mVQxYpWNwb0DgXHsEKn3/media/686776e39ca6fb85711983fc.jpeg"
                     alt="100% K9 Dog Boarding"
                     width="600"
                     style="display:block; width:100%; height:auto; border:none; outline:none;">

                <!-- Body -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding:24px 20px 8px;">
                      <h1 style="margin:0 0 12px; font-size:22px; line-height:1.35; color:#333; text-align:center;">
                        🐕 Booking Confirmation
                      </h1>
                      <p style="margin:0; font-size:16px; line-height:24px; color:#555;">
                        Hi ${bookingData.customerName},
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:12px 20px;">
                      <p style="margin:0 0 12px; font-size:16px; line-height:24px; color:#555;">
                        Your dog boarding booking has been confirmed! We're excited to care for ${bookingData.dogName} and provide them with a safe, fun and comfortable stay.
                      </p>
                    </td>
                  </tr>
              
                  <!-- Booking Details Card -->
                  <tr>
                    <td style="padding:0 20px;">
                      <div style="background:#ffffff; border:2px solid #1FB6E0; padding:18px 20px; border-radius:6px; margin:12px 0;">
                        <h3 style="font-size:18px; color:#1FB6E0; margin:0 0 12px;">📋 Booking Details</h3>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td style="padding:6px 0; font-size:15px; color:#555;">
                              <strong>Customer:</strong> ${bookingData.customerName}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:15px; color:#555;">
                              <strong>Dog:</strong> ${bookingData.dogName}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:15px; color:#555;">
                              <strong>Check-in:</strong> ${bookingData.checkIn}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:15px; color:#555;">
                              <strong>Check-out:</strong> ${bookingData.checkOut}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:15px; color:#555;">
                              <strong>Total Price:</strong> ${bookingData.totalPrice}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:15px; color:#555;">
                              <strong>Payment Method:</strong> ${
                                bookingData.paymentMethod === 'cash' ? 'Cash' :
                                bookingData.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                                'Card'
                              }
                            </td>
                          </tr>
                          ${bookingData.invoiceUrl ? `
                          <tr>
                            <td style="padding:12px 0 0; text-align:center;">
                              <a href="${bookingData.invoiceUrl}" target="_blank" style="background-color:#9ACA3C; color:#ffffff; text-decoration:none; display:inline-block; padding:10px 20px; border-radius:6px; font-weight:700; font-size:14px;">
                                View Invoice
                              </a>
                            </td>
                          </tr>
                          ` : ''}
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- Payment Instructions -->
                  <tr>
                    <td style="padding:0 20px;">
                      ${bookingData.paymentMethod === 'cash' ? `
                        <div style="background:#f0fdf4; border:2px solid #9ACA3C; padding:18px 20px; border-radius:6px; margin:12px 0;">
                          <h3 style="font-size:18px; color:#16a34a; margin:0 0 8px;">💵 Cash Payment Instructions</h3>
                          <p style="margin:0 0 8px; font-size:15px; color:#15803d; line-height:22px;">
                            Payment must be completed before the 3-week deadline (21 days before check-in).
                          </p>
                          <p style="margin:0 0 8px; font-size:15px; color:#15803d; line-height:22px;">
                            An invoice has been sent to your email for your records. Please keep this for accounting purposes.
                          </p>
                          <p style="margin:0; font-size:15px; color:#dc2626; line-height:22px; font-weight:700;">
                            Important: Payment must be received before your dog's check-in date.
                          </p>
                        </div>
                      ` : bookingData.paymentMethod === 'bank_transfer' ? `
                        <div style="background:#eff6ff; border:2px solid #1FB6E0; padding:18px 20px; border-radius:6px; margin:12px 0;">
                          <h3 style="font-size:18px; color:#0284c7; margin:0 0 8px;">🏦 Bank Transfer Instructions</h3>
                          <p style="margin:0 0 12px; font-size:15px; color:#0369a1; line-height:22px;">
                            An invoice with our bank account details has been sent to your email:
                          </p>
                          <ul style="margin:0 0 12px; padding-left:20px; font-size:15px; color:#0369a1; line-height:24px;">
                            <li>Account name: 100PERCENT K9 LIMITED</li>
                            <li>Account number: 12-3232-0496782-00</li>
                            <li>Reference: Use your invoice number</li>
                          </ul>
                          <p style="margin:0; font-size:15px; color:#0369a1; line-height:22px;">
                            Payment must be completed before the 3-week deadline (21 days before check-in).
                          </p>
                        </div>
                      ` : `
                        <div style="background:#ecfeff; border:2px solid#1FB6E0; padding:18px 20px; border-radius:6px; margin:12px 0;">
                          <h3 style="font-size:18px; color:#0891b2; margin:0 0 8px;">💳 Card Payment Instructions</h3>
                          <p style="margin:0 0 8px; font-size:15px; color:#0e7490; line-height:22px;">
                            An invoice with a secure payment link has been sent to your email.
                          </p>
                          <p style="margin:0 0 8px; font-size:15px; color:#0e7490; line-height:22px;">
                            Simply click the "Pay online" link in the invoice email to complete your payment.
                          </p>
                          <p style="margin:0; font-size:15px; color:#0e7490; line-height:22px;">
                            Payment must be completed before the 3-week deadline (21 days before check-in).
                          </p>
                        </div>
                      `}
                    </td>
                  </tr>

                  <!-- Add to Calendar Section -->
                  <tr>
                    <td style="padding:0 20px;">
                      <div style="background:#ecfeff; border:2px solid #1FB6E0; padding:18px 20px; border-radius:6px; margin:12px 0;">
                        <h3 style="font-size:18px; color:#0891b2; margin:0 0 8px; text-align:center;">📅 Add to Your Calendar</h3>
                        <p style="margin:0 0 12px; font-size:14px; color:#0e7490; line-height:20px; text-align:center;">
                          Never miss your booking! Add this to your calendar:
                        </p>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px;">
                          <tr>
                            <td align="center" style="padding:4px;">
                              <a href="${calendarLinks.googleUrl}" target="_blank" style="background-color:#4285F4; color:#ffffff; text-decoration:none; display:inline-block; padding:10px 20px; border-radius:6px; font-weight:700; font-size:14px; margin:4px;">
                                📅 Google Calendar
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:4px;">
                              <a href="${calendarLinks.outlookUrl}" target="_blank" style="background-color:#0078D4; color:#ffffff; text-decoration:none; display:inline-block; padding:10px 20px; border-radius:6px; font-weight:700; font-size:14px; margin:4px;">
                                📆 Outlook Calendar
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:4px;">
                              <a href="${calendarLinks.yahooUrl}" target="_blank" style="background-color:#6001D2; color:#ffffff; text-decoration:none; display:inline-block; padding:10px 20px; border-radius:6px; font-weight:700; font-size:14px; margin:4px;">
                                🗓️ Yahoo Calendar
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:8px 0 0; font-size:12px; color:#0e7490; line-height:18px; text-align:center;">
                          <strong>Check-in:</strong> 10:00 AM | <strong>Check-out:</strong> 4:00 PM
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Closing Message -->
                  <tr>
                    <td style="padding:8px 20px 24px;">
                      <p style="margin:0 0 12px; font-size:16px; line-height:24px; color:#555;">
                        We're excited to care for ${bookingData.dogName}! If you have any questions, please don't hesitate to contact us.
                      </p>
                      <p style="margin:0; font-size:16px; line-height:24px; color:#555;">
                        Mā te wā,<br>
                        The 100% K9 Team
                      </p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>

          <!-- Footer -->
          <div style="font-size:12px; color:#999; font-family:'Segoe UI', Tahoma, sans-serif; text-align:center; padding-top:36px; border-top:1px solid #e0e0e0; max-width:600px; margin:0 auto;">
            <table style="width:100%; margin-bottom:12px;">
              <tr>
                <td align="center">
                  <img src="https://i.imgur.com/UmDcaR6.png" alt="100% K9 Logo" style="width:200px; height:auto;" />
                </td>
              </tr>
            </table>
            <div style="margin-bottom:8px;">
              <a href="https://www.100percentk9.co.nz" target="_blank" style="color:#1FB6E0; text-decoration:none;">100percentk9.co.nz</a><br/>
              Auckland, New Zealand<br/>
              <a href="mailto:training@100percentk9.co.nz" target="_blank" style="color:#1FB6E0; text-decoration:none;">training@100percentk9.co.nz</a><br/>
              <a href="tel:02040812829" target="_blank" style="color:#1FB6E0; text-decoration:none;">020 4081 2829</a>
            </div>
            <div style="margin-top:16px;">
              <a href="https://www.facebook.com/100percentk9" target="_blank" style="margin: 0 8px; display:inline-block;">
                <img src="https://img.icons8.com/ios-filled/50/000000/facebook-circled--v1.png" alt="Facebook" style="width:24px; height:24px; border:none;">
              </a>
              <a href="https://www.instagram.com/100_percent_k9/" target="_blank" style="margin: 0 8px; display:inline-block;">
                <img src="https://img.icons8.com/ios-filled/50/000000/instagram-new.png" alt="Instagram" style="width:24px; height:24px; border:none;">
              </a>
              <a href="https://www.tiktok.com/@100_k9_nz?is_from_webapp=1&sender_device=pc" target="_blank" style="margin: 0 8px; display:inline-block;">
                <img src="https://img.icons8.com/ios-filled/50/000000/tiktok--v1.png" alt="TikTok" style="width:24px; height:24px; border:none;">
              </a>
            </div>
            <p style="margin-top:16px; color:#ccc;">© 2025 100% K9. All Rights Reserved.</p>
            <p style="margin-top:16px; font-size:10px; color:#999; max-width:500px; margin-left:auto; margin-right:auto;">
              <strong>Disclaimer:</strong> This email and any attachments are confidential and may be legally privileged. If you are not the intended recipient, please notify the sender immediately and delete all copies. Any unauthorised use, distribution or disclosure is prohibited.
            </p>
          </div>
        </body>
      </html>
    `;

    // For development, we'll use a simple approach
    // In production, you'd want to use proper SMTP credentials
    console.log('📧 Email would be sent to:', bookingData.customerEmail);
    console.log('📧 CC to owner:', 'hodgson_tane93@outlook.com');
    console.log('📧 Email content:', emailHtml);

    // For now, we'll just log the email. To actually send emails, you'd need:
    // 1. SMTP credentials (Gmail, SendGrid, etc.)
    // 2. App passwords or OAuth setup
    // 3. Proper environment variables

    return {
      success: true,
      message: 'Email notification logged (development mode)',
      emailContent: emailHtml
    };

  } catch (error) {
    console.error('Email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    };
  }
}

// For production use when you have SMTP credentials:
export async function sendEmailWithSMTP(bookingData: BookingEmailData) {
  // This would require SMTP setup:
  // const transporter = nodemailer.createTransporter({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_APP_PASSWORD
  //   }
  // });
  
  // return await transporter.sendMail({
  //   from: process.env.EMAIL_USER,
  //   to: bookingData.customerEmail,
  //   cc: 'hodgson_tane93@outlook.com',
  //   subject: `Booking Confirmation - ${bookingData.dogName}`,
  //   html: emailHtml
  // });
}