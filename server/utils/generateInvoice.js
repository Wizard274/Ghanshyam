const PDFDocument = require("pdfkit");

const generateInvoicePDF = (invoice, order, customer) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const primary = "#8B4513";
    const lightBg = "#FFF5F0";
    const textDark = "#1a1a1a";
    const textGray = "#666666";

    // Header background
    doc.rect(0, 0, 595, 130).fill(primary);

    // Shop name
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22).text("Ghanshyam Ladies Tailor", 50, 35);
    doc.fillColor("rgba(255,255,255,0.8)").font("Helvetica").fontSize(11).text("Precision and Perfection in Every Stitch", 50, 62);
    doc.fillColor("rgba(255,255,255,0.7)").fontSize(10).text("Phone: +91 8160942724  |  Address: Shop no:-21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar, Ahmedabad.", 50, 82);
    doc.fillColor("rgba(255,255,255,0.7)").fontSize(10).text("Email: ghanshyamladiestailor21@gmail.com", 50, 97);

    // Invoice label
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(26).text("INVOICE", 400, 45, { align: "right", width: 145 });
    doc.fillColor("rgba(255,255,255,0.85)").font("Helvetica").fontSize(10).text(invoice.invoiceNumber, 400, 80, { align: "right", width: 145 });

    let y = 150;

    // Invoice details box
    doc.roundedRect(50, y, 240, 90, 8).fill(lightBg);
    doc.fillColor(primary).font("Helvetica-Bold").fontSize(10).text("BILL TO", 65, y + 12);
    doc.fillColor(textDark).font("Helvetica-Bold").fontSize(12).text(customer.name, 65, y + 27);
    doc.fillColor(textGray).font("Helvetica").fontSize(10)
      .text(customer.email, 65, y + 43)
      .text(customer.phone, 65, y + 57)
      .text(customer.address || "N/A", 65, y + 71);

    doc.roundedRect(310, y, 235, 90, 8).fill(lightBg);
    doc.fillColor(primary).font("Helvetica-Bold").fontSize(10).text("INVOICE DETAILS", 325, y + 12);
    doc.fillColor(textGray).font("Helvetica").fontSize(10)
      .text("Invoice No:", 325, y + 27)
      .text("Order No:", 325, y + 42)
      .text("Date:", 325, y + 57)
      .text("Payment:", 325, y + 72);
    doc.fillColor(textDark).font("Helvetica-Bold").fontSize(10)
      .text(invoice.invoiceNumber, 415, y + 27)
      .text(order.orderNumber, 415, y + 42)
      .text(new Date(invoice.createdAt).toLocaleDateString("en-IN"), 415, y + 57)
      .text(invoice.paymentStatus, 415, y + 72);

    y += 115;

    // Order details
    doc.roundedRect(50, y, 495, 60, 8).fill(lightBg);
    doc.fillColor(primary).font("Helvetica-Bold").fontSize(10).text("ORDER DETAILS", 65, y + 10);
    doc.fillColor(textGray).font("Helvetica").fontSize(10)
      .text(`Cloth Type: ${order.clothType}`, 65, y + 26)
      .text(`Fabric: ${order.fabricType || "N/A"}`, 230, y + 26)
      .text(`Color: ${order.color || "N/A"}`, 400, y + 26)
      .text(`Delivery Date: ${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-IN") : "N/A"}`, 65, y + 42);

    y += 80;

    // Items table header
    doc.rect(50, y, 495, 32).fill(primary);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10)
      .text("DESCRIPTION", 65, y + 11)
      .text("QTY", 340, y + 11)
      .text("PRICE", 390, y + 11)
      .text("AMOUNT", 450, y + 11);

    y += 32;

    // Items
    let totalCheck = 0;
    invoice.items.forEach((item, i) => {
      const bg = i % 2 === 0 ? "#FFFFFF" : "#FFF9F6";
      doc.rect(50, y, 495, 28).fill(bg);
      doc.fillColor(textDark).font("Helvetica").fontSize(10)
        .text(item.name, 65, y + 9, { width: 270 })
        .text(item.quantity.toString(), 340, y + 9)
        .text(`₹${item.price.toFixed(2)}`, 390, y + 9)
        .text(`₹${(item.price * item.quantity).toFixed(2)}`, 450, y + 9);
      totalCheck += item.price * item.quantity;
      y += 28;
    });

    // Bottom border of table
    doc.rect(50, y, 495, 1).fill("#e0d5cf");
    y += 20;

    // Totals section
    const totalsX = 360;
    const totalsW = 185;

    const addTotalRow = (label, value, bold = false, color = textDark) => {
      if (bold) {
        doc.rect(totalsX - 10, y - 4, totalsW + 10, 26).fill(primary);
        doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(11)
          .text(label, totalsX, y + 2)
          .text(value, totalsX, y + 2, { align: "right", width: totalsW - 10 });
      } else {
        doc.fillColor(textGray).font("Helvetica").fontSize(10).text(label, totalsX, y);
        doc.fillColor(color).font("Helvetica").fontSize(10).text(value, totalsX, y, { align: "right", width: totalsW - 10 });
      }
      y += bold ? 30 : 18;
    };

    addTotalRow("Subtotal:", `₹${invoice.subtotal.toFixed(2)}`);
    if (invoice.discount > 0) addTotalRow("Discount:", `-₹${invoice.discount.toFixed(2)}`, false, "#e53935");
    if (invoice.tax > 0) addTotalRow("Tax (GST):", `₹${invoice.tax.toFixed(2)}`);
    addTotalRow("TOTAL AMOUNT", `₹${invoice.totalAmount.toFixed(2)}`, true);

    y += 10;

    // Payment status badge
    const statusColor = invoice.paymentStatus === "Paid" ? "#4CAF50" : invoice.paymentStatus === "Partial" ? "#FF9800" : "#F44336";
    doc.roundedRect(50, y, 160, 30, 6).fill(statusColor);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(11).text(`Payment: ${invoice.paymentStatus}`, 60, y + 9, { width: 140, align: "center" });

    if (invoice.paymentMethod) {
      doc.fillColor(textGray).font("Helvetica").fontSize(10).text(`Method: ${invoice.paymentMethod}`, 225, y + 9);
    }

    y += 50;

    // Notes
    if (invoice.notes) {
      doc.fillColor(textGray).font("Helvetica-Oblique").fontSize(9).text(`Note: ${invoice.notes}`, 50, y);
      y += 20;
    }

    // Footer
    const footerY = 770;
    doc.rect(0, footerY, 595, 72).fill(primary);
    doc.fillColor("rgba(255,255,255,0.9)").font("Helvetica").fontSize(10)
      .text("Thank you for choosing ઘનશ્યામ Ladies Tailor!", 0, footerY + 14, { align: "center", width: 595 });
    doc.fillColor("rgba(255,255,255,0.7)").fontSize(9)
      .text("Precision and Perfection in Every Stitch", 0, footerY + 32, { align: "center", width: 595 });
    doc.fillColor("rgba(255,255,255,0.5)").fontSize(8)
      .text("This is a computer-generated invoice. No signature required.", 0, footerY + 50, { align: "center", width: 595 });

    doc.end();
  });
};

module.exports = { generateInvoicePDF };
