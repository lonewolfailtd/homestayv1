// import nodemailer from 'nodemailer'; // Future email implementation

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  dogName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  invoiceUrl?: string;
  ghlSuccess: boolean;
  xeroSuccess: boolean;
}

export async function sendBookingConfirmation(bookingData: BookingEmailData) {
  try {
    // Create a simple HTML email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .status { margin: 10px 0; }
            .success { color: #059669; }
            .failed { color: #dc2626; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🐕 Booking Confirmation</h1>
              <p>100% K9 Dog Boarding</p>
            </div>
            
            <div class="content">
              <h2>Hi ${bookingData.customerName}!</h2>
              <p>Your dog boarding booking has been confirmed. Here are the details:</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <p><strong>Customer:</strong> ${bookingData.customerName}</p>
                <p><strong>Dog:</strong> ${bookingData.dogName}</p>
                <p><strong>Check-in:</strong> ${bookingData.checkIn}</p>
                <p><strong>Check-out:</strong> ${bookingData.checkOut}</p>
                <p><strong>Total Price:</strong> ${bookingData.totalPrice}</p>
                ${bookingData.invoiceUrl ? `<p><strong>Invoice:</strong> <a href="${bookingData.invoiceUrl}">View Invoice</a></p>` : ''}
              </div>
              
              <div class="booking-details">
                <h3>System Status</h3>
                <div class="status">
                  <span class="${bookingData.ghlSuccess ? 'success' : 'failed'}">
                    GoHighLevel CRM: ${bookingData.ghlSuccess ? '✅ Contact Created' : '❌ Failed'}
                  </span>
                </div>
                <div class="status">
                  <span class="${bookingData.xeroSuccess ? 'success' : 'failed'}">
                    Xero Invoice: ${bookingData.xeroSuccess ? '✅ Created' : '❌ Failed'}
                  </span>
                </div>
              </div>
              
              <p>We're excited to care for ${bookingData.dogName}! If you have any questions, please don't hesitate to contact us.</p>
            </div>
            
            <div class="footer">
              <p>100% K9 Dog Boarding<br>
              Email: info@100percentk9.co.nz<br>
              Website: www.100percentk9.co.nz</p>
            </div>
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