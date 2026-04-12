const PDFDocument = require("pdfkit");
const fs = require("fs");

const generateInvoicePDF = (invoice, order, customer) => {
  return new Promise((resolve, reject) => {
    // A4 size is 595.28 x 841.89
    // Margins: top 30, bottom 30, left/right 25
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 30, bottom: 30, left: 25, right: 25 },
      autoFirstPage: true,
      bufferPages: true,
    });
    
    // Prevent auto page breaks
    doc.on('pageAdded', () => {
      // we only want 1 page
    });

    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Try to load Arial for Rupee symbol support, fallback to Helvetica if missing on system
    let regularFont = "Helvetica";
    let boldFont = "Helvetica-Bold";
    let italicFont = "Helvetica-Oblique";
    
    if (fs.existsSync("C:/Windows/Fonts/arial.ttf")) {
        regularFont = "C:/Windows/Fonts/arial.ttf";
        boldFont = "C:/Windows/Fonts/arialbd.ttf";
        italicFont = "C:/Windows/Fonts/ariali.ttf";
    }

    const primary = "#8B4513";
    const lightBg = "#FFF5F0";
    const textDark = "#1a1a1a";
    const textGray = "#666666";

    const drawLine = (y) => {
      doc.moveTo(25, y).lineTo(570, y).lineWidth(1).strokeColor("#E0E0E0").stroke();
    };

    let y = 30;

    // --- HEADER SECTION ---
    doc.fillColor(primary).font(boldFont).fontSize(24).text("Ghanshyam Ladies Tailor", 25, y);
    doc.fillColor(textGray).font(italicFont).fontSize(11).text("Precision and Perfection in Every Stitch", 25, y + 28);
    
    // INVOICE text on right
    doc.fillColor(primary).font(boldFont).fontSize(28).text("INVOICE", 400, y, { align: "right", width: 170 });
    doc.fillColor(textDark).font(regularFont).fontSize(11).text(invoice.invoiceNumber, 400, y + 32, { align: "right", width: 170 });

    y += 55;
    doc.fillColor(textDark).font(regularFont).fontSize(10)
       .text("Phone: +91 8160942724", 25, y)
       .text("Email: ghanshyamladiestailor21@gmail.com", 25, y + 14)
       .text("Address: Shop no: 21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar, Ahmedabad", 25, y + 28, { width: 330 });

    y += 65;
    drawLine(y);
    y += 15;

    // --- CUSTOMER & INVOICE DETAILS SECTION ---
    doc.fillColor(primary).font(boldFont).fontSize(11).text("BILL TO", 25, y);
    doc.fillColor(textDark).font(boldFont).fontSize(12).text(customer.name, 25, y + 16);
    doc.fillColor(textGray).font(regularFont).fontSize(10)
       .text(`Email: ${customer.email}`, 25, y + 32)
       .text(`Phone: ${customer.phone}`, 25, y + 46)
       .text(`Address: ${customer.address || "N/A"}`, 25, y + 60, { width: 250 });

    doc.fillColor(primary).font(boldFont).fontSize(11).text("INVOICE DETAILS", 350, y);
    doc.fillColor(textGray).font(regularFont).fontSize(10)
       .text("Invoice No:", 350, y + 16)
       .text("Order No:", 350, y + 30)
       .text("Cloth Type:", 350, y + 44)
       .text("Date:", 350, y + 58)
       .text("Payment:", 350, y + 72)
       .text("Method:", 350, y + 86);

    doc.fillColor(textDark).font(boldFont).fontSize(10)
       .text(invoice.invoiceNumber, 430, y + 16)
       .text(order.orderNumber, 430, y + 30)
       .text(order.clothType || "Mixed", 430, y + 44)
       .text(new Date(invoice.createdAt).toLocaleDateString("en-IN"), 430, y + 58)
       .text(invoice.paymentStatus, 430, y + 72)
       .text(invoice.paymentMethod, 430, y + 86);

    y += 115;

    // --- TABLE SECTION ---
    doc.rect(25, y, 545, 30).fill(primary);
    doc.fillColor("#FFFFFF").font(boldFont).fontSize(10)
       .text("#", 35, y + 10)
       .text("DESCRIPTION", 60, y + 10)
       .text("QTY", 380, y + 10, { width: 40, align: "center" })
       .text("PRICE", 440, y + 10, { width: 50, align: "right" })
       .text("AMOUNT", 500, y + 10, { width: 60, align: "right" });
       
    y += 30;

    // Table rows
    invoice.items.forEach((item, i) => {
      const bg = i % 2 === 0 ? "#FFFFFF" : "#F9F9F9";
      doc.rect(25, y, 545, 28).fill(bg);
      doc.fillColor(textDark).font(regularFont).fontSize(10)
         .text((i + 1).toString(), 35, y + 9)
         .font(boldFont).text(item.name, 60, y + 9)
         .font(regularFont).text(item.quantity.toString(), 380, y + 9, { width: 40, align: "center" })
         .text(`₹${item.price.toFixed(2)}`, 440, y + 9, { width: 50, align: "right" })
         .font(boldFont).text(`₹${(item.price * item.quantity).toFixed(2)}`, 500, y + 9, { width: 60, align: "right" });
         
      if (item.description) {
         doc.font(regularFont).fontSize(9).fillColor(textGray).text(item.description, 60, y + 21);
         y += 12; // accommodate extra description line
      }
      y += 28;
    });

    doc.rect(25, y, 545, 1).fill("#E0E0E0");
    y += 15;

    // --- TOTAL SECTION ---
    const totalsX = 380;

    const addTotalRow = (label, value, isBold = false, isDanger = false) => {
      doc.fillColor(isDanger ? "#dc3545" : (isBold ? textDark : textGray)).font(isBold ? boldFont : regularFont).fontSize(isBold ? 12 : 10)
         .text(label, totalsX, y, { width: 80, align: "left" })
         .text(value, totalsX + 80, y, { width: 100, align: "right" });
      y += isBold ? 24 : 18;
    };

    addTotalRow("Subtotal", `₹${invoice.subtotal.toFixed(2)}`);
    if (invoice.discount > 0) addTotalRow("Discount", `-₹${invoice.discount.toFixed(2)}`, false, true);
    if (invoice.tax > 0) addTotalRow("Tax", `₹${invoice.tax.toFixed(2)}`);
    
    y += 4;
    doc.fillColor(primary).font(boldFont).fontSize(12)
       .text("Total", totalsX, y, { width: 100, align: "left" })
       .text(`₹${invoice.totalAmount.toFixed(2)}`, totalsX + 100, y, { width: 80, align: "right" });
       
    // --- FOOTER SECTION ---
    // Fix positioning at bottom
    const footerY = 770;
    
    // Colored bottom bar
    doc.fillColor(textGray).font(regularFont).fontSize(10)
       .text("Thank you for choosing Ghanshyam Ladies Tailor! · Precision and Perfection in Every Stitch", 25, footerY, { align: "center", width: 545 });


    doc.end();
  });
};

module.exports = { generateInvoicePDF };
