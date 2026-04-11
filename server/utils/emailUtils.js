const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendDeliveryScheduledEmail = async (order, customer, invoiceNumber, paymentStatus) => {
  const transporter = createTransporter();

  // Defensive check inside the mailer
  if (!order.deliveryDate) {
    console.error("Attempted to send delivery scheduled email but no delivery date is set.");
    return;
  }

  const formattedDate = new Date(order.deliveryDate).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="padding: 30px; text-align: left;">
        <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">Hello ${customer.name},</p>
        
        <p style="color: #444444; font-size: 15px; margin-bottom: 24px; line-height: 1.5;">
          Thank you for choosing Ghanshyam Ladies Tailor. Your order has been successfully created and is now confirmed.
        </p>
        
        <div style="background: #fcf8f5; border-left: 4px solid #8B4513; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #333333; font-size: 16px;">Order Details</h3>
          <p style="margin: 0 0 8px 0; color: #555555; font-size: 14px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 0 0 8px 0; color: #555555; font-size: 14px;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 0 0 8px 0; color: #555555; font-size: 14px;"><strong>Cloth Type:</strong> ${order.clothType}</p>
          <p style="margin: 0 0 8px 0; color: #555555; font-size: 14px;"><strong>Fabric:</strong> ${order.fabricType || "N/A"}</p>
          <p style="margin: 0 0 8px 0; color: #555555; font-size: 14px;"><strong>Color:</strong> ${order.color || "N/A"}</p>
          <p style="margin: 0 0 8px 0; color: #555555; font-size: 14px;"><strong>Payment Status:</strong> ${paymentStatus}</p>
        </div>
        
        <p style="color: #2c5e2e; font-size: 16px; font-weight: bold; margin-bottom: 12px;">
          Your order will be ready by: ${formattedDate}
        </p>

        <p style="color: #d84315; font-size: 14px; margin-bottom: 24px; font-weight: 500;">
          Note: All orders require a minimum of 3 days for completion.
        </p>

        <p style="color: #444444; font-size: 15px; margin-bottom: 30px;">
          We appreciate your trust in Ghanshyam Ladies Tailor.
        </p>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="color: #666666; font-size: 14px; font-style: italic; margin: 0 0 8px 0;">
          Precision and Perfection in Every Stitch
        </p>
        <p style="color: #999999; font-size: 12px; margin: 0;">
          This is an automated message. Please do not reply.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Ghanshyam Ladies Tailor" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: "Your Order is Confirmed – Delivery Scheduled",
      html,
    });
  } catch (error) {
    console.error("Order confirmation email failed to send:", error);
  }
};

const sendOrderCompletedEmail = async (order, customer, invoicePdfBuffer, invoiceTitle) => {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px;">Order Ready! 🎊</h1>
      </div>
      <div style="padding: 40px 32px; text-align: left;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Dear ${customer.name},</p>
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Great news! Your order <strong>${order.orderNumber}</strong> (${order.clothType}) has been completed and is now ready.
        </p>
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
           Please find your invoice attached to this email. You may collect your garment from our shop at your convenience.
        </p>
        <p style="color: #666; font-size: 15px;">
           Thank you for choosing ઘનશ્યામ Ladies Tailor! We hope you love the fit.
        </p>
      </div>
      <div style="background: #f9f5f2; padding: 16px; text-align: center;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">© 2026 ઘનશ્યામ Ladies Tailor. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"ઘનશ્યામ Ladies Tailor" <${process.env.EMAIL_USER}>`,
    to: customer.email,
    subject: `Order Completed - ${order.orderNumber} | ઘનશ્યામ Ladies Tailor`,
    html,
    attachments: [
      {
        filename: `${invoiceTitle || "Invoice"}.pdf`,
        content: invoicePdfBuffer,
        contentType: "application/pdf"
      }
    ]
  });
};

module.exports = {
  sendDeliveryScheduledEmail,
  sendOrderCompletedEmail
};
