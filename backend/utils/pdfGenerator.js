const PDFDocument = require('pdfkit');

function generateInvoicePDF(order, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=Invoice_${order.bill_number}.pdf`);

  doc.pipe(res);

  // Header Banner
  doc
    .rect(0, 0, 595.28, 100)
    .fill('#4A2511'); // Dark Teak Theme Color

  doc
    .fillColor('#FFFFFF')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('CHAI POINT & BAKERY', 40, 30);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Authentic Artisanal Tea & Delights', 40, 60)
    .text('Tax Invoice / Cash Receipt', 420, 35, { align: 'right' });

  // Bill & Customer Metadata
  doc.fillColor('#000000').fontSize(10);

  const startY = 120;
  doc
    .font('Helvetica-Bold').text('Invoice No:', 40, startY)
    .font('Helvetica').text(order.bill_number, 110, startY)
    .font('Helvetica-Bold').text('Date & Time:', 350, startY)
    .font('Helvetica').text(new Date(order.created_at || Date.now()).toLocaleString(), 430, startY);

  doc
    .font('Helvetica-Bold').text('Customer:', 40, startY + 18)
    .font('Helvetica').text(order.customer_name || 'Walk-in Customer', 110, startY + 18)
    .font('Helvetica-Bold').text('Payment Mode:', 350, startY + 18)
    .font('Helvetica').text((order.payment_method || 'CASH').toUpperCase(), 430, startY + 18);

  if (order.customer_phone) {
    doc
      .font('Helvetica-Bold').text('Phone:', 40, startY + 36)
      .font('Helvetica').text(order.customer_phone, 110, startY + 36);
  }

  // Divider Line
  doc
    .moveTo(40, startY + 60)
    .lineTo(555, startY + 60)
    .strokeColor('#D97706')
    .lineWidth(1.5)
    .stroke();

  // Table Header
  const tableTop = startY + 75;
  doc
    .rect(40, tableTop, 515, 25)
    .fill('#F3F4F6');

  doc
    .fillColor('#1F2937')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('S.No', 50, tableTop + 7)
    .text('Item Description', 100, tableTop + 7)
    .text('Price', 320, tableTop + 7, { width: 60, align: 'right' })
    .text('Qty', 390, tableTop + 7, { width: 40, align: 'right' })
    .text('Amount (₹)', 450, tableTop + 7, { width: 90, align: 'right' });

  // Table Rows
  let position = tableTop + 32;
  doc.font('Helvetica').fontSize(9).fillColor('#374151');

  if (order.items && order.items.length > 0) {
    order.items.forEach((item, index) => {
      doc
        .text(index + 1, 50, position)
        .text(item.product_name + (item.customization ? ` (${item.customization})` : ''), 100, position, { width: 210 })
        .text(`₹${parseFloat(item.unit_price).toFixed(2)}`, 320, position, { width: 60, align: 'right' })
        .text(item.quantity, 390, position, { width: 40, align: 'right' })
        .text(`₹${parseFloat(item.total_price).toFixed(2)}`, 450, position, { width: 90, align: 'right' });

      position += 20;

      // Draw light row separator
      doc
        .moveTo(40, position - 4)
        .lineTo(555, position - 4)
        .strokeColor('#E5E7EB')
        .lineWidth(0.5)
        .stroke();
    });
  }

  // Summary / Calculation Box
  const summaryTop = position + 15;

  doc
    .rect(340, summaryTop, 215, 100)
    .fillAndStroke('#FFFBEB', '#F59E0B');

  doc
    .fillColor('#1F2937')
    .font('Helvetica')
    .fontSize(10)
    .text('Subtotal:', 350, summaryTop + 12)
    .text(`₹${parseFloat(order.subtotal).toFixed(2)}`, 450, summaryTop + 12, { align: 'right', width: 95 })

    .text('Tax (5% GST):', 350, summaryTop + 30)
    .text(`₹${parseFloat(order.tax_amount).toFixed(2)}`, 450, summaryTop + 30, { align: 'right', width: 95 })

    .text('Discount:', 350, summaryTop + 48)
    .text(`- ₹${parseFloat(order.discount_amount).toFixed(2)}`, 450, summaryTop + 48, { align: 'right', width: 95 });

  doc
    .moveTo(350, summaryTop + 68)
    .lineTo(545, summaryTop + 68)
    .strokeColor('#D97706')
    .lineWidth(1)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#4A2511')
    .text('Grand Total:', 350, summaryTop + 76)
    .text(`₹${parseFloat(order.grand_total).toFixed(2)}`, 450, summaryTop + 76, { align: 'right', width: 95 });

  // Footer Note
  doc
    .fontSize(9)
    .font('Helvetica-Oblique')
    .fillColor('#6B7280')
    .text('Thank you for visiting Chai Point! Have a wonderful day ahead.', 40, summaryTop + 130, { align: 'center', width: 515 })
    .text('This is a computer-generated tax invoice.', 40, summaryTop + 145, { align: 'center', width: 515 });

  doc.end();
}

function generateReportPDF(stats, orders, startDate, endDate, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=SalesReport_${startDate}_to_${endDate}.pdf`);

  doc.pipe(res);

  // Header Banner
  doc
    .rect(0, 0, 595.28, 90)
    .fill('#4A2511');

  doc
    .fillColor('#FFFFFF')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('TEA SHOP SALES REPORT', 40, 25)
    .fontSize(10)
    .font('Helvetica')
    .text(`Period: ${startDate} to ${endDate}`, 40, 55);

  // Summary Metrics Cards
  const cardTop = 110;
  doc
    .rect(40, cardTop, 160, 60).fillAndStroke('#FEF3C7', '#F59E0B')
    .rect(215, cardTop, 160, 60).fillAndStroke('#D1FAE5', '#10B981')
    .rect(390, cardTop, 165, 60).fillAndStroke('#E0E7FF', '#6366F1');

  doc.fillColor('#1F2937').fontSize(9).font('Helvetica');
  doc.text('TOTAL REVENUE', 50, cardTop + 10);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#B45309').text(`₹${parseFloat(stats.total_revenue || 0).toFixed(2)}`, 50, cardTop + 30);

  doc.fillColor('#1F2937').fontSize(9).font('Helvetica');
  doc.text('TOTAL ORDERS', 225, cardTop + 10);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#047857').text(`${stats.total_orders || 0}`, 225, cardTop + 30);

  doc.fillColor('#1F2937').fontSize(9).font('Helvetica');
  doc.text('AVG ORDER VALUE', 400, cardTop + 10);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#4338CA').text(`₹${parseFloat(stats.avg_order_value || 0).toFixed(2)}`, 400, cardTop + 30);

  // Recent Orders Table Header
  const tableTop = 190;
  doc
    .fillColor('#1F2937')
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Order Transactions List', 40, tableTop);

  doc
    .rect(40, tableTop + 15, 515, 22)
    .fill('#E5E7EB');

  doc
    .fillColor('#1F2937')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('Bill No', 50, tableTop + 21)
    .text('Date', 150, tableTop + 21)
    .text('Customer', 260, tableTop + 21)
    .text('Mode', 380, tableTop + 21)
    .text('Total (₹)', 460, tableTop + 21, { width: 80, align: 'right' });

  let pos = tableTop + 42;
  doc.font('Helvetica').fontSize(8.5).fillColor('#374151');

  orders.slice(0, 20).forEach((ord) => {
    doc
      .text(ord.bill_number, 50, pos)
      .text(new Date(ord.created_at).toLocaleDateString(), 150, pos)
      .text(ord.customer_name || 'Walk-in', 260, pos, { width: 110 })
      .text((ord.payment_method || 'CASH').toUpperCase(), 380, pos)
      .text(`₹${parseFloat(ord.grand_total).toFixed(2)}`, 460, pos, { width: 80, align: 'right' });

    pos += 18;
  });

  doc.end();
}

module.exports = {
  generateInvoicePDF,
  generateReportPDF
};
