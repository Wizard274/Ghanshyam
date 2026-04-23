const { sendBrevoEmail } = require("./brevoConfig");
const OrderItem = require("../models/orderItemModel");
const { generateChallanPDF } = require("./generateChallan");

const sendDeliveryScheduledEmail = async (order, customer, invoiceNumber, paymentStatus) => {

  // Defensive check inside the mailer
  if (!order.deliveryDate) {
    console.error("Attempted to send delivery scheduled email but no delivery date is set.");
    return;
  }

  const formattedDate = new Date(order.deliveryDate).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const items = await OrderItem.find({ orderId: order._id }).lean();
  let itemsString = order.clothType || "Multiple Items Details Attached";
  if (items.length > 0) {
      itemsString = items.map(i => `${i.quantity}x ${i.clothType} (${i.fabricType || "No Fabric Spec"})`).join(", ");
  }

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
          ${invoiceNumber !== "N/A" ? `<p style="margin: 0 0 8px 0; color: #555555; font-size: 14px;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>` : ""}
          <p style="margin: 0 0 8px 0; color: #555555; font-size: 14px;"><strong>Items Tracked:</strong> ${itemsString}</p>
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

  const textContent = `Hello ${customer.name},\n\nThank you for choosing Ghanshyam Ladies Tailor. Your order has been successfully created and is now confirmed.\n\nOrder Number: ${order.orderNumber}\nItems Tracked: ${itemsString}\nPayment Status: ${paymentStatus}\n\nYour order will be ready by: ${formattedDate}\n\nWe appreciate your trust in Ghanshyam Ladies Tailor.`;

  try {
    await sendBrevoEmail(
      "Your Order is Confirmed – Delivery Scheduled",
      html,
      textContent,
      customer.email,
      customer.name
    );
  } catch (error) {
    console.error("Order confirmation email failed to send:", error);
  }
};

const sendChallanEmail = async (order, customer, challanPdfBuffer) => {

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px;">Challan Generated!</h1>
      </div>
      <div style="padding: 40px 32px; text-align: left;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Dear ${customer.name},</p>
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          An estimate (Challan) for your order <strong>${order.orderNumber}</strong> has been generated and is attached to this email.
        </p>
        <p style="color: #d84315; font-size: 16px; margin-bottom: 20px; font-weight: bold;">
           Please pay the 35% advance amount (₹${order.advanceAmount.toFixed(2)}) online via our portal to confirm your order. We cannot begin processing without it.
        </p>
      </div>
      <div style="background: #f9f5f2; padding: 16px; text-align: center;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">© 2026 ઘનશ્યામ Ladies Tailor. All rights reserved.</p>
      </div>
    </div>
  `;

  const textContent = `Dear ${customer.name},\n\nAn estimate (Challan) for your order ${order.orderNumber} has been generated and is attached to this email.\n\nPlease pay the 35% advance amount (₹${order.advanceAmount.toFixed(2)}) online via our portal to confirm your order. We cannot begin processing without it.`;

  const attachments = [{
    name: `EST-${order.orderNumber}.pdf`,
    content: challanPdfBuffer.toString('base64')
  }];

  await sendBrevoEmail(
    `Challan / Estimate - ${order.orderNumber} | ઘનશ્યામ Ladies Tailor`,
    html,
    textContent,
    customer.email,
    customer.name,
    attachments
  );
};

const sendOrderCompletedEmail = async (order, customer, invoicePdfBuffer, invoiceTitle) => {

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
           Please find your invoice attached to this email. Please select the delivery mode from your dashboard.
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

  const textContent = `Dear ${customer.name},\n\nGreat news! Your order ${order.orderNumber} (${order.clothType}) has been completed and is now ready.\n\nPlease find your invoice attached to this email. You may collect your garment from our shop at your convenience.\n\nThank you for choosing ઘનશ્યામ Ladies Tailor! We hope you love the fit.`;

  const attachments = [{
    name: `${invoiceTitle || "Invoice"}.pdf`,
    content: invoicePdfBuffer.toString('base64')
  }];

  await sendBrevoEmail(
    `Order Completed - ${order.orderNumber} | ઘનશ્યામ Ladies Tailor`,
    html,
    textContent,
    customer.email,
    customer.name,
    attachments
  );
};

const sendDeliveredEmail = async (order, customer) => {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px;">Thank You! 🛍️</h1>
      </div>
      <div style="padding: 40px 32px; text-align: left;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Dear ${customer.name},</p>
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Your order <strong>${order.orderNumber}</strong> has been successfully delivered. We hope you are delighted with the fit and quality of your new garment.
        </p>
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          It was a pleasure serving you. We look forward to seeing you again soon for your future tailoring needs.
        </p>
        <p style="color: #666; font-size: 15px;">
          Warm regards,<br/><strong>ઘનશ્યામ Ladies Tailor</strong>
        </p>
      </div>
      <div style="background: #f9f5f2; padding: 16px; text-align: center;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">© 2026 ઘનશ્યામ Ladies Tailor. All rights reserved.</p>
      </div>
    </div>
  `;

  const textContent = `Dear ${customer.name},\n\nYour order ${order.orderNumber} has been successfully delivered. We hope you are delighted with the fit and quality of your new garment.\n\nIt was a pleasure serving you. We look forward to seeing you again soon for your future tailoring needs.\n\nWarm regards,\nઘનશ્યામ Ladies Tailor`;

  await sendBrevoEmail(
    `Order Delivered - Thank You! | ઘનશ્યામ Ladies Tailor`,
    html,
    textContent,
    customer.email,
    customer.name
  );
};

module.exports = {
  sendDeliveryScheduledEmail,
  sendOrderCompletedEmail,
  sendChallanEmail,
  sendDeliveredEmail
};
