   const PDFDocument = require("pdfkit");
const fs = require("fs");

const generateInvoicePDF = (invoice, order, customer) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      autoFirstPage: true,
      bufferPages: true,
    });
    
    doc.on('pageAdded', () => {});

    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    let regularFont = "Helvetica";
    let boldFont = "Helvetica-Bold";
    let italicFont = "Helvetica-Oblique";
    
    if (fs.existsSync("C:/Windows/Fonts/arial.ttf")) {
        regularFont = "C:/Windows/Fonts/arial.ttf";
        boldFont = "C:/Windows/Fonts/arialbd.ttf";
        italicFont = "C:/Windows/Fonts/ariali.ttf";
    }

    const primary = "#8B4513";
    const palerBg = "#FFF5EE"; // primary-pale
    const textDark = "#1a1a1a";
    const textGray = "#666666";
    const leftX = 32;

    // --- HEADER SECTION (Gradient Background) ---
    const grad = doc.linearGradient(0, 0, 595, 120);
    grad.stop(0, "#8B4513").stop(1, "#D2691E");
    doc.rect(0, 0, 595, 120).fill(grad);

    let y = 30;

    doc.fillColor("#FFFFFF").font(boldFont).fontSize(20).text("Ghanshyam Ladies Tailor", leftX, y);
    doc.fillColor("#E0D3C8").font(italicFont).fontSize(12).text("Precision and Perfection in Every Stitch", leftX, y + 24);
    doc.fillColor("#E0D3C8").font(regularFont).fontSize(10)
       .text("Phone: +91 81609 42724   ·   Email: ghanshyamladiestailor21@gmail.com", leftX, y + 42)
       .text("Address: Shop no: 21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar.", leftX, y + 54);

    // Right Header Text
    doc.fillColor("#E0D3C8").font(regularFont).fontSize(10).text("INVOICE", 400, y - 2, { align: "right", width: 160 });
    doc.fillColor("#FFFFFF").font(boldFont).fontSize(22).text(invoice.invoiceNumber, 400, y + 10, { align: "right", width: 160 });
    doc.fillColor("#E0D3C8").font(regularFont).fontSize(11)
       .text(new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), 400, y + 38, { align: "right", width: 160 });

    y = 150;

    // --- META INFO ROW (Bill To / Invoice Details) ---
    // Bill To Box
    doc.rect(leftX, y, 255, 120).fillAndStroke(palerBg, palerBg);
    doc.fillColor(primary).font(boldFont).fontSize(11).text("BILL TO", leftX + 16, y + 16);
    doc.fillColor(textDark).font(boldFont).fontSize(14).text(customer.name, leftX + 16, y + 36);
    doc.fillColor(textGray).font(regularFont).fontSize(11)
       .text(customer.email, leftX + 16, y + 56)
       .text(customer.phone, leftX + 16, y + 70)
       .text(customer.address || "N/A", leftX + 16, y + 84, { width: 220, height: 26, ellipsis: true });

    // Invoice Details Box
    doc.rect(leftX + 275, y, 255, 120).fillAndStroke(palerBg, palerBg);
    doc.fillColor(primary).font(boldFont).fontSize(11).text("INVOICE DETAILS", leftX + 275 + 16, y + 16);
    
    const rStartX = leftX + 275 + 16;
    const rValX = rStartX + 80;
    doc.fillColor(textGray).font(regularFont).fontSize(11)
       .text("Invoice No.", rStartX, y + 36)
       .text("Order No.", rStartX, y + 50)
       .text("Cloth Type", rStartX, y + 64)
       .text("Payment", rStartX, y + 78)
       .text("Date", rStartX, y + 92);
       
    doc.fillColor(textDark).font(boldFont).fontSize(11)
       .text(invoice.invoiceNumber, rValX, y + 36)
       .text(order.orderNumber, rValX, y + 50)
       .text(order.clothType || "Mixed", rValX, y + 64)
       .text(`${invoice.paymentStatus} (${invoice.paymentMethod})`, rValX, y + 78)
       .text(new Date(invoice.createdAt).toLocaleDateString("en-IN"), rValX, y + 92);
       
    y += 150;

    // --- TABLE SECTION ---
    doc.rect(leftX, y, 530, 32).fill(primary);
    doc.fillColor("#FFFFFF").font(boldFont).fontSize(11)
       .text("#", leftX + 12, y + 10)
       .text("Description", leftX + 40, y + 10)
       .text("Qty", 360, y + 10, { width: 40, align: "center" })
       .text("Price", 420, y + 10, { width: 60, align: "right" })
       .text("Amount", 490, y + 10, { width: 60, align: "right" });
       
    y += 32;

    invoice.items.forEach((item, i) => {
       const bg = i % 2 === 0 ? "#FFFFFF" : "#FAFAFA";
       const rowH = item.description ? 44 : 32;
       doc.rect(leftX, y, 530, rowH).fill(bg);
       
       doc.fillColor(textGray).font(regularFont).fontSize(11).text(`${i + 1}`, leftX + 12, y + 10);
       doc.fillColor(textDark).font(boldFont).fontSize(11).text(item.name, leftX + 40, y + 10);
       
       if (item.description) {
           doc.fillColor(textGray).font(regularFont).fontSize(10).text(item.description, leftX + 40, y + 24);
       }
       
       doc.fillColor(textDark).font(regularFont).fontSize(11)
          .text(item.quantity.toString(), 360, y + 10, { width: 40, align: "center" })
          .text(`₹${item.price.toFixed(2)}`, 420, y + 10, { width: 60, align: "right" });
          
       doc.font(boldFont).text(`₹${(item.price * item.quantity).toFixed(2)}`, 490, y + 10, { width: 60, align: "right" });
       
       y += rowH;
    });
    
    // Bottom border
    doc.rect(leftX, y, 530, 1).fill("#EEEEEE");
    y += 24;

    // --- TOTALS SECTION ---
    const totX = leftX + 275;
    
    doc.fillColor(textGray).font(regularFont).fontSize(12)
       .text("Subtotal", totX, y, { width: 140, align: "left" })
       .text(`₹${invoice.subtotal.toFixed(2)}`, totX + 140, y, { width: 100, align: "right" });
    y += 24;
    
    if (invoice.discount > 0) {
        doc.fillColor("#dc3545").text("Discount", totX, y, { width: 140, align: "left" })
           .text(`-₹${invoice.discount.toFixed(2)}`, totX + 140, y, { width: 100, align: "right" });
        y += 24;
    }
    
    if (invoice.tax > 0) {
        doc.fillColor(textGray).text("Tax", totX, y, { width: 140, align: "left" })
           .text(`₹${invoice.tax.toFixed(2)}`, totX + 140, y, { width: 100, align: "right" });
        y += 24;
    }
    
    doc.rect(totX, y, 255, 42).fill(primary);
    doc.fillColor("#FFFFFF").font(boldFont).fontSize(14)
       .text("Total", totX + 16, y + 14, { width: 120, align: "left" })
       .text(`₹${invoice.totalAmount.toFixed(2)}`, totX + 120, y + 14, { width: 115, align: "right" });
    
    y += 64;

    // --- NOTES & FOOTER ---
    if (invoice.notes) {
        doc.rect(leftX, y, 530, 36).fill(palerBg);
        doc.fillColor(textGray).font(italicFont).fontSize(11)
           .text(`Note: ${invoice.notes}`, leftX + 16, y + 12);
    }

    doc.fillColor(textGray).font(italicFont).fontSize(11)
       .text("Thank you for choosing Ghanshyam Ladies Tailor!", leftX, 790, { align: "center", width: 530 });

    doc.end();
  });
};

module.exports = { generateInvoicePDF };

// touch